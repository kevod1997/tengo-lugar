/*
  Warnings:

  - You are about to drop the column `year` on the `CarModel` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[brandId,model]` on the table `CarModel` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "CarModel_brandId_model_year_key";

-- AlterTable
ALTER TABLE "Car" ADD COLUMN     "year" INTEGER;

-- AlterTable
ALTER TABLE "CarModel" DROP COLUMN "year";

-- CreateIndex
CREATE UNIQUE INDEX "CarModel_brandId_model_key" ON "CarModel"("brandId", "model");
