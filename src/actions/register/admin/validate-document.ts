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
import { notifyUser } from "@/actions/notifications";
import { eventType } from "@/types/websocket-events";

const identityService = new IdentityValidationService();
const licenceService = new LicenceValidationService();
const insuranceService = new InsuranceValidationService();
const cardService = new CarCardValidationService();
const emailService = new EmailService(
  process.env.RESEND_API_KEY!
);

function translateDocumentType(documentType: string): string {
  switch (documentType) {
    case 'IDENTITY':
      return 'documento de identidad';
    case 'LICENCE':
      return 'licencia de conducir';
    case 'INSURANCE':
      return 'seguro';
    case 'CARD':
      return 'tarjeta del vehículo';
    default:
      return 'documento';
  }
}

function translateDocumentStatus(status: string): string {
  switch (status) {
    case 'VERIFIED':
      return 'verificado';
    case 'FAILED':
      return 'rechazado';
    default:
      return status.toLowerCase();
  }
}

function getEventTypeFromDocumentValidation(documentType: string, status: 'VERIFIED' | 'FAILED'): eventType | undefined {
  const eventMap: Record<string, eventType> = {
    'IDENTITY_VERIFIED': 'identity_card_verified',
    'IDENTITY_FAILED': 'identity_card_rejected',
    'LICENCE_VERIFIED': 'license_verified',
    'LICENCE_FAILED': 'license_rejected',
    'INSURANCE_VERIFIED': 'car_insurance_verified',
    'INSURANCE_FAILED': 'car_insurance_rejected',
    'CARD_VERIFIED': 'vehicle_card_verified',
    'CARD_FAILED': 'vehicle_card_rejected'
  };

  const key = `${documentType}_${status}`;
  return eventMap[key] || undefined;
}

export async function validateDocument(request: DocumentValidationRequest, userEmail: string, userId: string) {

  const session = await requireAuthorization('admin', 'validate-document.ts', 'validateDocument');
  if (!session) {
    throw ServerActionError.AuthorizationFailed('validate-document.ts', 'validateDocument');
  }

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



      // Log successful email
      await logActionWithErrorHandling(
        {
          userId,
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
        {
          userId,
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

    // Publish real-time event for WebSocket notification (non-blocking)
    const status: 'VERIFIED' | 'FAILED' =
      validateDocumentResult.data?.status as 'VERIFIED' | 'FAILED';

    const eventType = getEventTypeFromDocumentValidation(
      request.documentType,
      status
    );
    // const link = undefined
    const additionalData = {
      carPlate: validateDocumentResult.data.carPlate,
      status: validateDocumentResult.data.status,
        failureReason: validateDocumentResult.data.failureReason,
        frontKey: validateDocumentResult.data.frontKey,
        backKey: validateDocumentResult.data.backKey
      }
  
  await notifyUser(
    userId,
    'Verificación de Documento',
    `${translateDocumentType(request.documentType)}: ${translateDocumentStatus(validateDocumentResult.data?.status || '')}.`,
    eventType ?? undefined,
    undefined,
    additionalData ?? undefined
  );

}

revalidatePath('/admin/dashboard');
return validateDocumentResult;
}