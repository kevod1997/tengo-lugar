import { VerificationStatus } from "@prisma/client";

export interface DocumentValidationResponse {
    documentId: string;
    status: VerificationStatus;
    failureReason?: string | null;
    carPlate?: string | null;
    frontKey?: boolean | null;
    backKey?: boolean | null;
    verifiedAt?: Date | null;
  }