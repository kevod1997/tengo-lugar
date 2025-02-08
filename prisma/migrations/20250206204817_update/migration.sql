-- DropForeignKey
ALTER TABLE "VehicleCard" DROP CONSTRAINT "VehicleCard_driverCarId_fkey";

-- DropIndex
DROP INDEX "VehicleCard_carId_driverCarId_key";

-- DropIndex
DROP INDEX "VehicleCard_driverCarId_key";

-- AlterTable
ALTER TABLE "VehicleCard" ALTER COLUMN "driverCarId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "VehicleCard_carId_driverCarId_idx" ON "VehicleCard"("carId", "driverCarId");

-- AddForeignKey
ALTER TABLE "VehicleCard" ADD CONSTRAINT "VehicleCard_driverCarId_fkey" FOREIGN KEY ("driverCarId") REFERENCES "DriverCar"("id") ON DELETE SET NULL ON UPDATE CASCADE;
