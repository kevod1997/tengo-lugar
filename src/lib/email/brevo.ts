import { ServiceError } from "../exceptions/service-error";

// const brevo = require('@getbrevo/brevo');
import * as brevo from '@getbrevo/brevo';

export class BrevoAPI {
  private apiInstance: any;

  constructor(apiKey: string) {
    this.apiInstance = new brevo.TransactionalEmailsApi();
    this.apiInstance.authentications['apiKey'].apiKey = apiKey;
  }

  async sendEmail(sendSmtpEmail: any): Promise<void> {
    try {
      await this.apiInstance.sendTransacEmail(sendSmtpEmail);
    } catch (error) {
      throw ServiceError.FailedToSendEmail((error as Error).message, 'brevo.ts', 'sendEmail');
    }
  }
}

