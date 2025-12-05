import { serve } from "inngest/next";

import { inngest } from "@/lib/inngest";
import { completeExpiredTripsFunction } from "@/utils/inngest/complete-expired-trips";
import { expireUnpaidReservationsFunction } from "@/utils/inngest/expire-unpaid-reservations";
import { rejectPendingReservationsFunction } from "@/utils/inngest/reject-pending-reservations";
import { sendDocumentVerificationEmail } from "@/utils/inngest/send-document-verification-email";
import { sendPaymentVerifiedNotifications } from "@/utils/inngest/send-payment-verified-notifications";
import { sendReviewReminder, sendReviewReceivedNotification } from "@/utils/inngest/send-review-reminder";

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