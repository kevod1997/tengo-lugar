'use server'

import { EmailService } from "@/services/email/email-service";
import { CarCardValidationService } from "@/services/registration/admin/document/car-card-validation-service";
import { IdentityValidationService } from "@/services/registration/admin/document/identity-validation-service";
import { InsuranceValidationService } from "@/services/registration/admin/document/insurance-validation-service";
import { LicenceValidationService } from "@/services/registration/admin/document/licence-validation-service";
import { DocumentValidationRequest } from "@/types/request/image-documents-validation";
import { revalidatePath } from "next/cache";

const identityService = new IdentityValidationService();
const licenceService = new LicenceValidationService();
const insuranceService = new InsuranceValidationService();
const cardService = new CarCardValidationService();
const emailService = new EmailService(
  process.env.BREVO_API_KEY!
);

export async function validateDocument(request: DocumentValidationRequest, userEmail: string) {
  const service =
    request.documentType === 'IDENTITY' ? identityService :
      request.documentType === 'LICENCE' ? licenceService :
        request.documentType === 'INSURANCE' ? insuranceService :
          request.documentType === 'CARD' ? cardService :
            null;

  //todo ajustar error 
  if (!service) {
    throw new Error('Invalid document type');
  }

  const ValidateDocumentresult = await service.validateDocument(request);
  let sendEmailResult;

  if (ValidateDocumentresult.success && ValidateDocumentresult.data) {
    sendEmailResult = await emailService.sendDocumentVerificationEmail({
      to: userEmail,
      documentType: request.documentType,
      status: ValidateDocumentresult.data?.status!,
      failureReason: ValidateDocumentresult.data?.failureReason || undefined
    });

  }

  revalidatePath('/admin/dashboard');
  //todo implementar sistema de cola por si falla el envio del email
  return ValidateDocumentresult
}
