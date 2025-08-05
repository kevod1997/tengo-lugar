import { VerificationStatus } from "@prisma/client";

export interface DocumentValidationResponse {
    documentId: string;
    status: VerificationStatus;
    verifiedAt?: Date | null;
    failureReason?: string | null;
  }