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

const identityService = new IdentityValidationService();
const licenceService = new LicenceValidationService();
const insuranceService = new InsuranceValidationService();
const cardService = new CarCardValidationService();
const emailService = new EmailService(
  process.env.BREVO_API_KEY!
);

export async function validateDocument(request: DocumentValidationRequest, userEmail: string) {

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