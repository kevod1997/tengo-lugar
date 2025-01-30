-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('NAFTA', 'DIESEL', 'GNC', 'ELECTRICO', 'HIBRIDO');

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarModel" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "fuelType" "FuelType" NOT NULL,
    "averageFuelConsume" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "CarModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Car" (
    "id" TEXT NOT NULL,
    "plate" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "carModelId" TEXT NOT NULL,
    "insuredCarId" TEXT,

    CONSTRAINT "Car_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuredCar" (
    "id" TEXT NOT NULL,
    "policyNumber" INTEGER NOT NULL,
    "expireDate" TIMESTAMP(3) NOT NULL,
    "fileKey" TEXT NOT NULL,
    "fileType" "FileType" NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "insuranceId" TEXT NOT NULL,

    CONSTRAINT "InsuredCar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Insurance" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Insurance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverCar" (
    "id" TEXT NOT NULL,
    "assignmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "driverId" TEXT NOT NULL,
    "carId" TEXT NOT NULL,

    CONSTRAINT "DriverCar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CarModel_brandId_idx" ON "CarModel"("brandId");

-- CreateIndex
CREATE UNIQUE INDEX "Car_plate_key" ON "Car"("plate");

-- CreateIndex
CREATE INDEX "Car_carModelId_idx" ON "Car"("carModelId");

-- CreateIndex
CREATE INDEX "Car_insuredCarId_idx" ON "Car"("insuredCarId");

-- CreateIndex
CREATE INDEX "InsuredCar_insuranceId_idx" ON "InsuredCar"("insuranceId");

-- CreateIndex
CREATE INDEX "DriverCar_driverId_idx" ON "DriverCar"("driverId");

-- CreateIndex
CREATE INDEX "DriverCar_carId_idx" ON "DriverCar"("carId");

-- CreateIndex
CREATE UNIQUE INDEX "DriverCar_driverId_carId_key" ON "DriverCar"("driverId", "carId");

-- AddForeignKey
ALTER TABLE "CarModel" ADD CONSTRAINT "CarModel_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Car" ADD CONSTRAINT "Car_carModelId_fkey" FOREIGN KEY ("carModelId") REFERENCES "CarModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Car" ADD CONSTRAINT "Car_insuredCarId_fkey" FOREIGN KEY ("insuredCarId") REFERENCES "InsuredCar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuredCar" ADD CONSTRAINT "InsuredCar_insuranceId_fkey" FOREIGN KEY ("insuranceId") REFERENCES "Insurance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverCar" ADD CONSTRAINT "DriverCar_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverCar" ADD CONSTRAINT "DriverCar_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
