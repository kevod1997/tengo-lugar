'use server'

import { EmailService } from "@/services/email/email-service";
import { CarCardValidationService } from "@/services/registration/admin/document/car-card-validation-service";
import { IdentityValidationService } from "@/services/registration/admin/document/identity-validation-service";
import { InsuranceValidationService } from "@/services/registration/admin/document/insurance-validation-service";
import { LicenceValidationService } from "@/services/registration/admin/document/licence-validation-service";
import { DocumentValidationRequest } from "@/types/request/image-documents-validation";
import { revalidatePath } from "next/cache";
import { ServerActionError } from "@/lib/exceptions/server-action-error";
import { inngest } from "@/lib/inngest";
import { logActionWithErrorHandling } from "@/services/logging/logging-service";
import { TipoAccionUsuario } from "@/types/actions-logs";
import { requireAuthorization } from "@/utils/helpers/auth-helper";
import { DocumentVerificationUpdatePayload } from "@/types/sse-types";
import { publishUserEvent } from "@/lib/sse/sse-publisher";
import prisma from "@/lib/prisma";
//todo ver el comportamiento del cierre del modal cuando se hace el onclick en el validar documento

const identityService = new IdentityValidationService();
const licenceService = new LicenceValidationService();
const insuranceService = new InsuranceValidationService();
const cardService = new CarCardValidationService();
const emailService = new EmailService(
  process.env.BREVO_API_KEY!
);

export async function validateDocument(request: DocumentValidationRequest, userEmail: string, userId: string) {

  const session = await requireAuthorization('admin', 'validate-document.ts', 'validateDocument');

  const service =
    request.documentType === 'IDENTITY' ? identityService :
      request.documentType === 'LICENCE' ? licenceService :
        request.documentType === 'INSURANCE' ? insuranceService :
          request.documentType === 'CARD' ? cardService :
            null;

  // Improved error handling with a specific error type
  if (!service) {
    throw ServerActionError.ValidationFailed(
      'validate-document.ts',
      'validateDocument',
      `Invalid document type: ${request.documentType}`
    );
  }

  const validateDocumentResult = await service.validateDocument(request);
  
  if (validateDocumentResult.success && validateDocumentResult.data) {
    try {
      // Try to send the email directly first
      await emailService.sendDocumentVerificationEmail({
        to: userEmail,
        documentType: request.documentType,
        status: validateDocumentResult.data?.status,
        failureReason: validateDocumentResult.data?.failureReason || undefined
      });

      try {
        // Obtener el estado actual del documento DESPUÉS de la validación
        // para tener los fileKeys correctos y otros IDs si es necesario.
        let sseFrontFileKey: string | null | undefined = undefined;
        let sseBackFileKey: string | null | undefined = undefined;
        let sseCarId: string | undefined = undefined;
        let sseCardId: string | undefined = undefined;
        // let sseCardType: PrismaCardType | undefined = undefined; // Si es necesario

        // Esta consulta es para asegurar que el payload SSE tenga la info más actualizada
        // especialmente los fileKeys si se borraron.
        switch (request.documentType) {
          case 'IDENTITY':
            const idCard = await prisma.identityCard.findUnique({
              where: { id: request.documentId },
              select: { frontFileKey: true, backFileKey: true }
            });
            if (idCard) {
              sseFrontFileKey = idCard.frontFileKey;
              sseBackFileKey = idCard.backFileKey;
            }
            break;
          case 'LICENCE':
            const licence = await prisma.licence.findUnique({
              where: { id: request.documentId },
              select: { frontFileKey: true, backFileKey: true }
            });
            if (licence) {
              sseFrontFileKey = licence.frontFileKey;
              sseBackFileKey = licence.backFileKey;
            }
            break;
          case 'INSURANCE': // Necesita carId
            const policy = await prisma.insurancePolicy.findUnique({
              where: {id: request.documentId },
              select: { fileKey: true, insuredCar: { select: { cars: { take: 1, select: { id: true }}}}} // Ajusta esta consulta!
            });
            if (policy) {
              sseFrontFileKey = policy.fileKey; // Asumiendo que el seguro usa 'frontFileKey' para su único archivo
              // sseCarId = policy.insuredCar?.cars[0]?.id; // Ejemplo, ajusta a tu modelo
            }
            console.warn("SSE payload para INSURANCE: carId necesita lógica de obtención correcta.");
            break;
          case 'CARD': // Necesita carId y cardId (que es request.documentId)
            const vCard = await prisma.vehicleCard.findUnique({
              where: {id: request.documentId },
              select: { fileKey: true, carId: true, cardType: true }
            });
            if (vCard) {
              sseFrontFileKey = vCard.fileKey;
              sseCarId = vCard.carId;
              sseCardId = request.documentId; // El documentId es el cardId
              // sseCardType = vCard.cardType;
            }
            break;
        }

        const ssePayload: DocumentVerificationUpdatePayload = {
          userId,
          dataType: request.documentType, 
          documentId: request.documentId,
          status: validateDocumentResult.data.status, 
          failureReason: validateDocumentResult.data.failureReason || undefined,
          frontFileKey: sseFrontFileKey,
          backFileKey: sseBackFileKey,
          carId: sseCarId,
          cardId: sseCardId,
          // cardType: sseCardType,
        };

        const eventName = 'user_verification_update';
        await publishUserEvent(userId, eventName, ssePayload);
      } catch (sseError) {
         console.error("Error al construir o emitir evento SSE:", sseError);
      }
      
      // Log successful email
      await logActionWithErrorHandling(
        {
          userId: session.user.id,
          action: TipoAccionUsuario.VERIFICACION_DOCUMENTO,
          status: 'SUCCESS',
          details: { 
            documentType: request.documentType,
            status: validateDocumentResult.data?.status,
            emailSent: true 
          }
        },
        {
          fileName: 'validate-document.ts',
          functionName: 'validateDocument'
        }
      );
    } catch (error) {
      console.log(error);
      // If direct sending fails, queue it with Inngest
      await inngest.send({
        name: "document-verification-email",
        data: {
          to: userEmail,
          documentType: request.documentType,
          status: validateDocumentResult.data?.status,
          failureReason: validateDocumentResult.data?.failureReason || undefined
        }
      });
      
      // Log that we queued the email
      await logActionWithErrorHandling(
        //todo fix
        {
          userId: "admin",  // Use the admin ID here or a parameter if available
          action: TipoAccionUsuario.VERIFICACION_DOCUMENTO,
          status: 'SUCCESS',
          details: { 
            documentType: request.documentType,
            status: validateDocumentResult.data?.status, 
            emailQueued: true 
          }
        },
        {
          fileName: 'validate-document.ts',
          functionName: 'validateDocument'
        }
      );
    }
  }

  revalidatePath('/admin/dashboard');
  return validateDocumentResult;
}