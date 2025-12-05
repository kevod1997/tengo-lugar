import { rejectExpiredPendingReservations } from "@/actions/trip/reject-pending-reservations";
import { inngest } from "@/lib/inngest";
import { logError } from "@/services/logging/logging-service";

export const rejectPendingReservationsFunction = inngest.createFunction(
  {
    id: "reject-pending-reservations",
    retries: 3,
    concurrency: {
      limit: 1
    }
  },
  { cron: "0 */3 * * *" }, // Run every 3 hours
  async ({ step }) => {
    try {
      // Use steps to get automatic retry with backoff
      const result = await step.run("reject-expired-pending-reservations", async () => {
        return await rejectExpiredPendingReservations();
      });

      return { 
        success: true, 
        message: result.message,
        data: result.success ? result.data : { processedReservations: 0 },
        originalResult: result
      };
    } catch (error) {
      await logError({
        origin: 'Inngest Background Job',
        code: 'RESERVATION_REJECTION_FAILED',
        message: 'Failed to reject expired pending reservations',
        details: error instanceof Error ? error.message : 'Unknown error',
        fileName: 'reject-pending-reservations.ts',
        functionName: 'rejectPendingReservationsFunction'
      });

      throw error;
    }
  }
);