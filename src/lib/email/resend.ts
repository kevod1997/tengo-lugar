import { Resend } from 'resend';

import { ServiceError } from "../exceptions/service-error";

export interface SendEmailParams {
  from: string;
  to: string[];
  subject: string;
  html: string;
}

export class ResendAPI {
  private resend: Resend;

  constructor(apiKey: string) {
    this.resend = new Resend(apiKey);
  }

  async sendEmail(params: SendEmailParams): Promise<void> {
    try {
      await this.resend.emails.send({
        from: params.from,
        to: params.to,
        subject: params.subject,
        html: params.html,
      });
    } catch (error) {
      throw ServiceError.FailedToSendEmail((error as Error).message, 'resend.ts', 'sendEmail');
    }
  }
}