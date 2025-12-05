import { REVIEW_REMINDER_CONFIG } from "@/lib/constants/review-reminder-config";
import { inngest } from "@/lib/inngest";
import { EmailService } from "@/services/email/email-service";
import { logError } from "@/services/logging/logging-service";

const emailService = new EmailService(process.env.RESEND_API_KEY!);

export const sendReviewReminder = inngest.createFunction(
  {
    id: "send-review-reminder",
    retries: 5
  },
  { event: "send-review-reminder" },
  async ({ event, step }) => {
    const {
      userId,
      userName,
      userEmail,
      tripId,
      tripOrigin,
      tripDestination,
      departureDate,
      reviewType
    } = event.data;

    try {
      await step.run("send-review-reminder-email", async () => {
        // Generate review URL
        const reviewUrl = REVIEW_REMINDER_CONFIG.getReviewUrl(tripId);

        // Send email
        await emailService.sendReviewReminderEmail({
          to: userEmail,
          userName,
          reviewUrl,
          tripOrigin,
          tripDestination,
          departureDate,
          reviewType: reviewType === 'DRIVER' ? 'driver' : 'passenger',
        });

        console.log(`[Inngest] Review reminder sent to ${userEmail} for trip ${tripId}`);

        return { success: true };
      });

      return {
        success: true,
        message: `Review reminder email sent successfully to ${userEmail}`,
        userId,
        tripId
      };
    } catch (error) {
      await logError({
        origin: 'Inngest Background Job - Review Reminder',
        code: 'REVIEW_REMINDER_EMAIL_ERROR',
        message: `Failed to send review reminder email to user ${userId} for trip ${tripId}`,
        details: error instanceof Error ? error.message : 'Unknown error',
        fileName: 'send-review-reminder.ts',
        functionName: 'sendReviewReminder'
      });

      throw error;
    }
  }
);

export const sendReviewReceivedNotification = inngest.createFunction(
  {
    id: "send-review-received-notification",
    retries: 5
  },
  { event: "review-received-notification" },
  async ({ event, step }) => {
    const {
      userId,
      userName,
      userEmail,
      reviewerName,
      rating
    } = event.data;

    try {
      await step.run("send-review-received-email", async () => {
        // Generate profile URL
        const profileUrl = REVIEW_REMINDER_CONFIG.getProfileUrl(userId);

        // Send email
        await emailService.sendReviewReceivedEmail({
          to: userEmail,
          userName,
          reviewerName,
          rating,
          profileUrl,
        });

        console.log(`[Inngest] Review received notification sent to ${userEmail}`);

        return { success: true };
      });

      return {
        success: true,
        message: `Review received notification email sent successfully to ${userEmail}`,
        userId
      };
    } catch (error) {
      await logError({
        origin: 'Inngest Background Job - Review Received Notification',
        code: 'REVIEW_RECEIVED_NOTIFICATION_ERROR',
        message: `Failed to send review received notification to user ${userId}`,
        details: error instanceof Error ? error.message : 'Unknown error',
        fileName: 'send-review-reminder.ts',
        functionName: 'sendReviewReceivedNotification'
      });

      throw error;
    }
  }
);
