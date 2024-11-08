/*
  Warnings:

  - A unique constraint covering the columns `[driverId]` on the table `Rating` will be added. If there are existing duplicate values, this will fail.
  - Made the column `frontFileKey` on table `IdentityCard` required. This step will fail if there are existing NULL values in that column.
  - Made the column `backFileKey` on table `IdentityCard` required. This step will fail if there are existing NULL values in that column.
  - Made the column `verifiedAt` on table `IdentityCard` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fileType` on table `IdentityCard` required. This step will fail if there are existing NULL values in that column.
  - Made the column `idNumber` on table `IdentityCard` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `driverId` to the `Rating` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "IdentityCard" ALTER COLUMN "frontFileKey" SET NOT NULL,
ALTER COLUMN "backFileKey" SET NOT NULL,
ALTER COLUMN "verifiedAt" SET NOT NULL,
ALTER COLUMN "fileType" SET NOT NULL,
ALTER COLUMN "idNumber" SET NOT NULL;

-- AlterTable
ALTER TABLE "Rating" ADD COLUMN     "driverId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Licence" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "expiration" TIMESTAMP(3) NOT NULL,
    "frontFileKey" TEXT NOT NULL,
    "backFileKey" TEXT NOT NULL,
    "fileType" "FileType" NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "failureReason" TEXT,

    CONSTRAINT "Licence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Driver_userId_key" ON "Driver"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Licence_driverId_key" ON "Licence"("driverId");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_driverId_key" ON "Rating"("driverId");

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Licence" ADD CONSTRAINT "Licence_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
