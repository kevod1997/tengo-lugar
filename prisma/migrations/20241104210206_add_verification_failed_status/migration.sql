/*
  Warnings:

  - You are about to drop the column `isVerified` on the `IdentityCard` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'FAILED');

-- AlterTable
ALTER TABLE "IdentityCard" DROP COLUMN "isVerified",
ADD COLUMN     "failureReason" TEXT,
ADD COLUMN     "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING';
