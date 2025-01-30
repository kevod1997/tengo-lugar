import { VerificationStatus } from '@prisma/client';
import { ApiHandler } from '@/lib/api-handler';
import { ApiResponse } from '@/types/api-types';
import { getFailedEmailTemplate, getVerifiedEmailTemplate } from '@/utils/email/email-templates';
import { ServiceError } from '@/lib/exceptions/service-error';
import { BrevoAPI } from '@/lib/email/brevo';
import { DocumentType } from '@/types/request/image-documents-validation';

const brevo = require('@getbrevo/brevo');

interface SendDocumentVerificationEmailParams {
  to: string;
  documentType: DocumentType;
  status: VerificationStatus;
  failureReason?: string;
}

export class EmailService {
  private brevoAPI: BrevoAPI;

  constructor(apiKey: string) {
    this.brevoAPI = new BrevoAPI(apiKey);
  }

  async sendDocumentVerificationEmail(params: SendDocumentVerificationEmailParams): Promise<ApiResponse<void>> {
    try {
      const documentTypeInSpanish = this.getDocumentTypeInSpanish(params.documentType);

      let subject: string;
      let htmlContent: string;

      if (params.status === VerificationStatus.VERIFIED) {
        subject = `Tu ${documentTypeInSpanish} ha sido verificado`;
        htmlContent = getVerifiedEmailTemplate(documentTypeInSpanish);
      } else if (params.status === VerificationStatus.FAILED) {
        subject = `La verificación de tu ${documentTypeInSpanish} ha fallado`;
        htmlContent = getFailedEmailTemplate(documentTypeInSpanish, params.failureReason);
      } else {
        throw ServiceError.InvalidEmailTemplate('email-service.ts', 'sendDocumentVerificationEmail');
      }

      const sendSmtpEmail = new brevo.SendSmtpEmail();
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = htmlContent;
      sendSmtpEmail.sender = { name: "Tengo Lugar", email: "kevindefalco@gmail.com" };
      sendSmtpEmail.to = [{ email: params.to }];

      await this.brevoAPI.sendEmail(sendSmtpEmail).catch((error) => {
        throw ServiceError.FailedToSendEmail((error as Error).message, 'email-service.ts', 'sendDocumentVerificationEmail');
      });

      return ApiHandler.handleSuccess(undefined);
    } catch (error) {
      return ApiHandler.handleError(error);
    }
  }

  private getDocumentTypeInSpanish(documentType: DocumentType): string {
    const documentTypes = {
      IDENTITY: 'documento de identidad',
      LICENCE: 'licencia de conducir',
      INSURANCE: 'póliza de seguro'
    };
    return documentTypes[documentType];
  }
}