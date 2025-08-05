import { VerificationStatus } from '@prisma/client';
import { ApiHandler } from '@/lib/api-handler';
import { ApiResponse } from '@/types/api-types';
import { ServiceError } from '@/lib/exceptions/service-error';
import { ResendAPI } from '@/lib/email/resend';
import { DocumentType } from '@/types/request/image-documents-validation';
import { render } from '@react-email/render';
import { DocumentVerified, DocumentFailed, PasswordReset, EmailVerification } from '@/emails';

export interface SendDocumentVerificationEmailParams {
  to: string;
  documentType: DocumentType;
  status: VerificationStatus;
  failureReason?: string;
}

export class EmailService {
  private resendAPI: ResendAPI;

  constructor(apiKey: string) {
    this.resendAPI = new ResendAPI(apiKey);
  }

  async sendDocumentVerificationEmail(params: SendDocumentVerificationEmailParams): Promise<ApiResponse<void>> {
    try {
      const documentTypeInSpanish = this.getDocumentTypeInSpanish(params.documentType);

      let subject: string;
      let htmlContent: string;

      if (params.status === VerificationStatus.VERIFIED) {
        subject = `Tu ${documentTypeInSpanish} ha sido verificado`;
        htmlContent = await render(DocumentVerified({ documentType: documentTypeInSpanish }));
      } else if (params.status === VerificationStatus.FAILED) {
        subject = `La verificación de tu ${documentTypeInSpanish} ha fallado`;
        htmlContent = await render(DocumentFailed({ 
          documentType: documentTypeInSpanish, 
          failureReason: params.failureReason 
        }));
      } else {
        throw ServiceError.InvalidEmailTemplate('email-service.ts', 'sendDocumentVerificationEmail');
      }

      await this.resendAPI.sendEmail({
        from: "Tengo Lugar <info@tengolugar.store>",
        to: [params.to],
        subject: subject,
        html: htmlContent,
      }).catch((error) => {
        throw ServiceError.FailedToSendEmail((error as Error).message, 'email-service.ts', 'sendDocumentVerificationEmail');
      });

      return ApiHandler.handleSuccess(undefined);
    } catch (error) {
      return ApiHandler.handleError(error);
    }
  }

  async sendEmail(to: string, subject: string, htmlContent: string): Promise<ApiResponse<void>> {
    try {
      await this.resendAPI.sendEmail({
        from: "Tengo Lugar <info@tengolugar.store>",
        to: [to],
        subject: subject,
        html: htmlContent,
      }).catch((error) => {
        throw ServiceError.FailedToSendEmail((error as Error).message, 'email-service.ts', 'sendEmail');
      });

      return ApiHandler.handleSuccess(undefined);
    } catch (error) {
      return ApiHandler.handleError(error);
    }
  }

  async sendPasswordResetEmail(to: string, resetUrl: string, userName?: string): Promise<ApiResponse<void>> {
    try {
      const htmlContent = await render(PasswordReset({ resetUrl, userName }));
      
      await this.resendAPI.sendEmail({
        from: "Tengo Lugar <info@tengolugar.store>",
        to: [to],
        subject: "Restablecer contraseña - Tengo Lugar",
        html: htmlContent,
      }).catch((error) => {
        throw ServiceError.FailedToSendEmail((error as Error).message, 'email-service.ts', 'sendPasswordResetEmail');
      });

      return ApiHandler.handleSuccess(undefined);
    } catch (error) {
      return ApiHandler.handleError(error);
    }
  }

  async sendEmailVerificationEmail(to: string, verificationUrl: string, userName?: string): Promise<ApiResponse<void>> {
    try {
      const htmlContent = await render(EmailVerification({ verificationUrl, userName }));
      
      await this.resendAPI.sendEmail({
        from: "Tengo Lugar <info@tengolugar.store>",
        to: [to],
        subject: "Verifica tu email - Tengo Lugar",
        html: htmlContent,
      }).catch((error) => {
        throw ServiceError.FailedToSendEmail((error as Error).message, 'email-service.ts', 'sendEmailVerificationEmail');
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
      INSURANCE: 'póliza de seguro',
      CARD: 'tarjeta',
    };
    return documentTypes[documentType];
  }
}