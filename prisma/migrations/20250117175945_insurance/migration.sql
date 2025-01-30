/*
  Warnings:

  - You are about to drop the column `expireDate` on the `InsuredCar` table. All the data in the column will be lost.
  - You are about to drop the column `failureReason` on the `InsuredCar` table. All the data in the column will be lost.
  - You are about to drop the column `fileKey` on the `InsuredCar` table. All the data in the column will be lost.
  - You are about to drop the column `fileType` on the `InsuredCar` table. All the data in the column will be lost.
  - You are about to drop the column `policyNumber` on the `InsuredCar` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `InsuredCar` table. All the data in the column will be lost.
  - You are about to drop the column `verifiedAt` on the `InsuredCar` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[currentPolicyId]` on the table `InsuredCar` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `isExpired` to the `InsuredCar` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CardType" AS ENUM ('GREEN', 'BLUE');

-- AlterTable
ALTER TABLE "InsuredCar" DROP COLUMN "expireDate",
DROP COLUMN "failureReason",
DROP COLUMN "fileKey",
DROP COLUMN "fileType",
DROP COLUMN "policyNumber",
DROP COLUMN "status",
DROP COLUMN "verifiedAt",
ADD COLUMN     "currentPolicyId" TEXT,
ADD COLUMN     "isExpired" BOOLEAN NOT NULL;

-- CreateTable
CREATE TABLE "InsurancePolicy" (
    "id" TEXT NOT NULL,
    "policyNumber" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "expireDate" TIMESTAMP(3) NOT NULL,
    "fileKey" TEXT NOT NULL,
    "fileType" "FileType" NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "insuredCarId" TEXT NOT NULL,

    CONSTRAINT "InsurancePolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleCard" (
    "id" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "driverId" TEXT,
    "cardType" "CardType" NOT NULL,
    "fileKey" TEXT NOT NULL,
    "fileType" "FileType" NOT NULL,
    "expirationDate" TIMESTAMP(3) NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "failureReason" TEXT,

    CONSTRAINT "VehicleCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InsurancePolicy_insuredCarId_idx" ON "InsurancePolicy"("insuredCarId");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleCard_carId_cardType_key" ON "VehicleCard"("carId", "cardType");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleCard_carId_driverId_key" ON "VehicleCard"("carId", "driverId");

-- CreateIndex
CREATE UNIQUE INDEX "InsuredCar_currentPolicyId_key" ON "InsuredCar"("currentPolicyId");

-- CreateIndex
CREATE INDEX "InsuredCar_currentPolicyId_idx" ON "InsuredCar"("currentPolicyId");

-- AddForeignKey
ALTER TABLE "InsuredCar" ADD CONSTRAINT "InsuredCar_currentPolicyId_fkey" FOREIGN KEY ("currentPolicyId") REFERENCES "InsurancePolicy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsurancePolicy" ADD CONSTRAINT "InsurancePolicy_insuredCarId_fkey" FOREIGN KEY ("insuredCarId") REFERENCES "InsuredCar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleCard" ADD CONSTRAINT "VehicleCard_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleCard" ADD CONSTRAINT "VehicleCard_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;
