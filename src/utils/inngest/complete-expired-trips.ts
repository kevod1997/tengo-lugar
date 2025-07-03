import { inngest } from "@/lib/inngest";
import { completeExpiredTrips } from "@/actions/trip/complete-trip";
import { logError } from "@/services/logging/logging-service";

export const completeExpiredTripsFunction = inngest.createFunction(
  {
    id: "complete-expired-trips",
    retries: 3
  },
  { cron: "0 */4 * * *" }, // Run every 4 hours
  async ({ step }) => {
    try {
      // Use steps to get automatic retry with backoff
      const result = await step.run("complete-expired-trips", async () => {
        return await completeExpiredTrips();
      });

      return { 
        success: true, 
        message: "Expired trips completion process finished",
        data: result.success ? result.data : { processedTrips: 0 },
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