import { inngest } from "@/lib/inngest";
import { EmailService } from "@/services/email/email-service";
import { logError } from "@/services/logging/logging-service";

const emailService = new EmailService(process.env.RESEND_API_KEY!);

export const sendDocumentVerificationEmail = inngest.createFunction(
  {
    id: "send-document-verification-email",
    retries: 5
  },
  { event: "document-verification-email" },
  async ({ event, step }) => {
    const { to, documentType, status, failureReason } = event.data;

    try {
      // Use steps to get automatic retry with backoff
      await step.run("send-email", async () => {
        await emailService.sendDocumentVerificationEmail({
          to,
          documentType,
          status,
          failureReason
        });

        return { success: true };
      });

      return { success: true, message: "Email sent successfully" };
    } catch (error) {
      await logError({
        origin: 'Email Service',
        code: 'EMAIL_SENDING_FAILED',
        message: 'Failed to send document verification email',
        details: error instanceof Error ? error.message : 'Unknown error',
        fileName: 'sendDocumentVerificationEmail.ts',
        functionName: 'sendDocumentVerificationEmail'
      });

      throw error;
    }
  }
);