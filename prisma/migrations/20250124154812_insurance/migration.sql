/*
  Warnings:

  - You are about to drop the column `insuranceId` on the `InsuredCar` table. All the data in the column will be lost.
  - Added the required column `insuranceId` to the `InsurancePolicy` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "InsuredCar" DROP CONSTRAINT "InsuredCar_insuranceId_fkey";

-- DropIndex
DROP INDEX "InsuredCar_insuranceId_idx";

-- AlterTable
ALTER TABLE "InsurancePolicy" ADD COLUMN     "insuranceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "InsuredCar" DROP COLUMN "insuranceId";

-- CreateIndex
CREATE INDEX "InsurancePolicy_insuranceId_idx" ON "InsurancePolicy"("insuranceId");

-- AddForeignKey
ALTER TABLE "InsurancePolicy" ADD CONSTRAINT "InsurancePolicy_insuranceId_fkey" FOREIGN KEY ("insuranceId") REFERENCES "Insurance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
