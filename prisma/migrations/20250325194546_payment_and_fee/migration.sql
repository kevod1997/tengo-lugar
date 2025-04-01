/*
  Warnings:

  - You are about to drop the column `paymentDate` on the `TripPassenger` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `TripPassenger` table. All the data in the column will be lost.
  - You are about to drop the column `paymentReference` on the `TripPassenger` table. All the data in the column will be lost.
  - You are about to drop the column `paymentStatus` on the `TripPassenger` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "FeePolicyType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'PER_SEAT');

-- DropIndex
DROP INDEX "TripPassenger_paymentStatus_idx";

-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "categoryId" TEXT;

-- AlterTable
ALTER TABLE "TripPassenger" DROP COLUMN "paymentDate",
DROP COLUMN "paymentMethod",
DROP COLUMN "paymentReference",
DROP COLUMN "paymentStatus";

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "tripPassengerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ARS',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankTransfer" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "accountOwner" TEXT,
    "transferDate" TIMESTAMP(3),
    "proofFileKey" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "failureReason" TEXT,

    CONSTRAINT "BankTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripCategory" (
    "id" TEXT NOT NULL,
    "feePolicyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "TripCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeePolicy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "serviceFeeRate" DOUBLE PRECISION NOT NULL,
    "serviceFeeType" "FeePolicyType" NOT NULL DEFAULT 'PERCENTAGE',
    "minimumFee" DOUBLE PRECISION,
    "maximumFee" DOUBLE PRECISION,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeePolicy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_tripPassengerId_key" ON "Payment"("tripPassengerId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BankTransfer_paymentId_key" ON "BankTransfer"("paymentId");

-- CreateIndex
CREATE INDEX "BankTransfer_verificationStatus_idx" ON "BankTransfer"("verificationStatus");

-- CreateIndex
CREATE INDEX "TripCategory_feePolicyId_idx" ON "TripCategory"("feePolicyId");

-- CreateIndex
CREATE INDEX "Trip_categoryId_idx" ON "Trip"("categoryId");

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TripCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_tripPassengerId_fkey" FOREIGN KEY ("tripPassengerId") REFERENCES "TripPassenger"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankTransfer" ADD CONSTRAINT "BankTransfer_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripCategory" ADD CONSTRAINT "TripCategory_feePolicyId_fkey" FOREIGN KEY ("feePolicyId") REFERENCES "FeePolicy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
