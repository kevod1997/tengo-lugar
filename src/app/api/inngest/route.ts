import { inngest } from "@/lib/inngest";
import { sendDocumentVerificationEmail } from "@/utils/inngest/send-document-verification-email";
import { completeExpiredTripsFunction } from "@/utils/inngest/complete-expired-trips";
import { rejectPendingReservationsFunction } from "@/utils/inngest/reject-pending-reservations";
import { expireUnpaidReservationsFunction } from "@/utils/inngest/expire-unpaid-reservations";
import { sendReviewReminder, sendReviewReceivedNotification } from "@/utils/inngest/send-review-reminder";
import { sendPaymentVerifiedNotifications } from "@/utils/inngest/send-payment-verified-notifications";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    sendDocumentVerificationEmail,
    completeExpiredTripsFunction,
    rejectPendingReservationsFunction,
    expireUnpaidReservationsFunction,
    sendReviewReminder,
    sendReviewReceivedNotification,
    sendPaymentVerifiedNotifications
  ]
});