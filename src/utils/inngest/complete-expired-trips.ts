import { inngest } from "@/lib/inngest";
import { completeExpiredTrips } from "@/actions/trip/complete-trip";
import { logError } from "@/services/logging/logging-service";

export const completeExpiredTripsFunction = inngest.createFunction(
  {
    id: "complete-expired-trips",
    retries: 3,
    concurrency: {
      limit: 1
    }
  },
  { cron: "0 */2 * * *" }, // Run every 2 hours
  async ({ step }) => {
    try {
      // Use steps to get automatic retry with backoff
      const result = await step.run("complete-expired-trips", async () => {
        return await completeExpiredTrips();
      });

      // Log más detallado con información de viajes procesados
      if (result.success && result.data) {
        const {
          processedTrips = 0,
          completedTrips = 0,
          cancelledTrips = 0,
          successCount = 0,
          failureCount = 0,
          skippedTrips = 0
        } = result.data;

        console.log(
          `[Inngest] Processed ${processedTrips} trips: ` +
          `${completedTrips} completed, ${cancelledTrips} cancelled (no passengers), ` +
          `${failureCount} failed. ` +
          `${skippedTrips > 0 ? `⚠️ ${skippedTrips} skipped (missing durationSeconds)` : ''}`
        );
      }

      return {
        success: true,
        message: "Expired trips completion process finished",
        data: result.success ? result.data : {
          processedTrips: 0,
          completedTrips: 0,
          cancelledTrips: 0,
          skippedTrips: 0
        },
        originalResult: result
      };
    } catch (error) {
      await logError({
        origin: 'Inngest Background Job',
        code: 'TRIP_COMPLETION_FAILED',
        message: 'Failed to complete expired trips',
        details: error instanceof Error ? error.message : 'Unknown error',
        fileName: 'complete-expired-trips.ts',
        functionName: 'completeExpiredTripsFunction'
      });

      throw error;
    }
  }
);