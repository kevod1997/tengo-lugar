import { inngest } from "@/lib/inngest";
import { EmailService } from "@/services/email/email-service";
import { logError } from "@/services/logging/logging-service";

//todo ver bien si conviene hacer una cola cuanod utilicemos los servicios de resend, ya que no sabemos bien como funciona el envio de los emails, pensemos en un caso que se tengan que mandar varios emails en conjunto, si se mandan todos juntos o si se mandan de a uno, si se mandan de a uno, se podria hacer una cola para que se manden de a uno, si se mandan todos juntos, no se podria hacer una cola, ya que se mandarian todos juntos

// Initialize the email service
const emailService = new EmailService(process.env.BREVO_API_KEY!);

export const sendDocumentVerificationEmail = inngest.createFunction(
    { 
        id: "send-document-verification-email",
        // Customize retry behavior
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
      // Log the error (Inngest will handle the retry)
      await logError({
        origin: 'Email Service',
        code: 'EMAIL_SENDING_FAILED',
        message: 'Failed to send document verification email',
        details: error instanceof Error ? error.message : 'Unknown error',
        fileName: 'sendDocumentVerificationEmail.ts',
        functionName: 'sendDocumentVerificationEmail'
      });
      
      throw error; // Re-throw to trigger Inngest's retry mechanism
    }
  }
);