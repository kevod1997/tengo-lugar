import { inngest } from "@/lib/inngest";
import { sendDocumentVerificationEmail } from "@/utils/inngest/send-document-verification-email";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    sendDocumentVerificationEmail
  ]
});