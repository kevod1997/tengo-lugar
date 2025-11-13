import { VerificationStatus } from '@prisma/client';
import { ApiHandler } from '@/lib/api-handler';
import { ApiResponse } from '@/types/api-types';
import { ServiceError } from '@/lib/exceptions/service-error';
import { ResendAPI } from '@/lib/email/resend';
import { DocumentType } from '@/types/request/image-documents-validation';
import { render } from '@react-email/render';
import { DocumentVerified, DocumentFailed, PasswordReset, EmailVerification, ReviewReminder, ReviewReceived, PaymentVerifiedPassenger, PaymentVerifiedDriver } from '@/emails';

export interface SendDocumentVerificationEmailParams {
  to: string;
  documentType: DocumentType;
  status: VerificationStatus;
  failureReason?: string;
}

export interface SendReviewReminderEmailParams {
  to: string;
  userName: string;
  reviewUrl: string;
  tripOrigin: string;
  tripDestination: string;
  departureDate: string;
  reviewType: 'driver' | 'passenger';
}

export interface SendReviewReceivedEmailParams {
  to: string;
  userName: string;
  reviewerName: string;
  rating: number;
  profileUrl: string;
}

export interface SendPaymentVerifiedEmailToPassengerParams {
  to: string;
  passengerName: string;
  amount: number;
  tripOrigin: string;
  tripDestination: string;
  departureDate: string;
  departureTime: string;
  seatsReserved: number;
  tripUrl: string;
}

export interface SendPaymentVerifiedEmailToDriverParams {
  to: string;
  driverName: string;
  passengerName: string;
  amount: number;
  tripOrigin: string;
  tripDestination: string;
  departureDate: string;
  departureTime: string;
  seatsReserved: number;
  tripUrl: string;
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

  async sendReviewReminderEmail(params: SendReviewReminderEmailParams): Promise<ApiResponse<void>> {
    try {
      const htmlContent = await render(ReviewReminder({
        userName: params.userName,
        reviewUrl: params.reviewUrl,
        tripOrigin: params.tripOrigin,
        tripDestination: params.tripDestination,
        departureDate: params.departureDate,
        reviewType: params.reviewType,
      }));

      await this.resendAPI.sendEmail({
        from: "Tengo Lugar <info@tengolugar.store>",
        to: [params.to],
        subject: "¡Califica tu viaje en Tengo Lugar!",
        html: htmlContent,
      }).catch((error) => {
        throw ServiceError.FailedToSendEmail((error as Error).message, 'email-service.ts', 'sendReviewReminderEmail');
      });

      return ApiHandler.handleSuccess(undefined);
    } catch (error) {
      return ApiHandler.handleError(error);
    }
  }

  async sendReviewReceivedEmail(params: SendReviewReceivedEmailParams): Promise<ApiResponse<void>> {
    try {
      const htmlContent = await render(ReviewReceived({
        userName: params.userName,
        reviewerName: params.reviewerName,
        rating: params.rating,
        profileUrl: params.profileUrl,
      }));

      await this.resendAPI.sendEmail({
        from: "Tengo Lugar <info@tengolugar.store>",
        to: [params.to],
        subject: "¡Recibiste una nueva calificación!",
        html: htmlContent,
      }).catch((error) => {
        throw ServiceError.FailedToSendEmail((error as Error).message, 'email-service.ts', 'sendReviewReceivedEmail');
      });

      return ApiHandler.handleSuccess(undefined);
    } catch (error) {
      return ApiHandler.handleError(error);
    }
  }

  async sendPaymentVerifiedEmailToPassenger(params: SendPaymentVerifiedEmailToPassengerParams): Promise<ApiResponse<void>> {
    try {
      const htmlContent = await render(PaymentVerifiedPassenger({
        passengerName: params.passengerName,
        amount: params.amount,
        tripOrigin: params.tripOrigin,
        tripDestination: params.tripDestination,
        departureDate: params.departureDate,
        departureTime: params.departureTime,
        seatsReserved: params.seatsReserved,
        tripUrl: params.tripUrl,
      }));

      await this.resendAPI.sendEmail({
        from: "Tengo Lugar <info@tengolugar.store>",
        to: [params.to],
        subject: "¡Tu pago ha sido confirmado!",
        html: htmlContent,
      }).catch((error) => {
        throw ServiceError.FailedToSendEmail((error as Error).message, 'email-service.ts', 'sendPaymentVerifiedEmailToPassenger');
      });

      return ApiHandler.handleSuccess(undefined);
    } catch (error) {
      return ApiHandler.handleError(error);
    }
  }

  async sendPaymentVerifiedEmailToDriver(params: SendPaymentVerifiedEmailToDriverParams): Promise<ApiResponse<void>> {
    try {
      const htmlContent = await render(PaymentVerifiedDriver({
        driverName: params.driverName,
        passengerName: params.passengerName,
        amount: params.amount,
        tripOrigin: params.tripOrigin,
        tripDestination: params.tripDestination,
        departureDate: params.departureDate,
        departureTime: params.departureTime,
        seatsReserved: params.seatsReserved,
        tripUrl: params.tripUrl,
      }));

      await this.resendAPI.sendEmail({
        from: "Tengo Lugar <info@tengolugar.store>",
        to: [params.to],
        subject: "Nuevo pasajero confirmado en tu viaje",
        html: htmlContent,
      }).catch((error) => {
        throw ServiceError.FailedToSendEmail((error as Error).message, 'email-service.ts', 'sendPaymentVerifiedEmailToDriver');
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