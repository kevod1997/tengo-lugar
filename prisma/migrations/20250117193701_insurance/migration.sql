/*
  Warnings:

  - You are about to drop the column `driverId` on the `VehicleCard` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[driverCarId]` on the table `VehicleCard` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[carId,driverCarId]` on the table `VehicleCard` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `driverCarId` to the `VehicleCard` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "VehicleCard" DROP CONSTRAINT "VehicleCard_driverId_fkey";

-- DropIndex
DROP INDEX "VehicleCard_carId_driverId_key";

-- AlterTable
ALTER TABLE "VehicleCard" DROP COLUMN "driverId",
ADD COLUMN     "driverCarId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "VehicleCard_driverCarId_key" ON "VehicleCard"("driverCarId");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleCard_carId_driverCarId_key" ON "VehicleCard"("carId", "driverCarId");

-- AddForeignKey
ALTER TABLE "VehicleCard" ADD CONSTRAINT "VehicleCard_driverCarId_fkey" FOREIGN KEY ("driverCarId") REFERENCES "DriverCar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
