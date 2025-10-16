import { inngest } from "@/lib/inngest";
import { sendDocumentVerificationEmail } from "@/utils/inngest/send-document-verification-email";
import { completeExpiredTripsFunction } from "@/utils/inngest/complete-expired-trips";
import { rejectPendingReservationsFunction } from "@/utils/inngest/reject-pending-reservations";
import { expireUnpaidReservationsFunction } from "@/utils/inngest/expire-unpaid-reservations";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    sendDocumentVerificationEmail,
    completeExpiredTripsFunction,
    rejectPendingReservationsFunction,
    expireUnpaidReservationsFunction
  ]
});