-- AlterTable
ALTER TABLE "Driver" ADD COLUMN     "disabledReason" TEXT,
ADD COLUMN     "enabledAt" TIMESTAMP(3),
ADD COLUMN     "isEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastEligibilityCheck" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
