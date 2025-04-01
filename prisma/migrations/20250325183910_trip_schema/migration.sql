/*
  Warnings:

  - You are about to drop the `Rating` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "RevieweeType" AS ENUM ('DRIVER', 'PASSENGER');

-- CreateEnum
CREATE TYPE "LuggageAllowance" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'EXTRA');

-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CONFIRMED', 'CANCELLED_BY_DRIVER', 'CANCELLED_BY_PASSENGER', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_driverId_fkey";

-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_passengerId_fkey";

-- AlterTable
ALTER TABLE "Driver" ADD COLUMN     "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalReviews" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Passenger" ADD COLUMN     "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalReviews" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "Rating";

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "reviewedId" TEXT NOT NULL,
    "revieweeType" "RevieweeType" NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL,
    "driverCarId" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "departureTime" TIMESTAMP(3) NOT NULL,
    "price" INTEGER NOT NULL,
    "distance" DOUBLE PRECISION,
    "availableSeats" INTEGER NOT NULL,
    "status" "TripStatus" NOT NULL DEFAULT 'PENDING',
    "isFull" BOOLEAN NOT NULL DEFAULT false,
    "priceGuide" DOUBLE PRECISION,
    "maximumPrice" DOUBLE PRECISION,
    "serviceFee" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "autoApproveReservations" BOOLEAN NOT NULL DEFAULT false,
    "luggageAllowance" "LuggageAllowance" NOT NULL DEFAULT 'MEDIUM',
    "allowPets" BOOLEAN NOT NULL DEFAULT false,
    "allowChildren" BOOLEAN NOT NULL DEFAULT true,
    "smokingAllowed" BOOLEAN NOT NULL DEFAULT false,
    "additionalNotes" TEXT,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripPassenger" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "passengerId" TEXT NOT NULL,
    "reservationStatus" "ReservationStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "seatsReserved" INTEGER NOT NULL DEFAULT 1,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "paymentMethod" TEXT,
    "paymentReference" TEXT,
    "paymentDate" TIMESTAMP(3),
    "reservationMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripPassenger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Review_tripId_idx" ON "Review"("tripId");

-- CreateIndex
CREATE INDEX "Review_reviewerId_idx" ON "Review"("reviewerId");

-- CreateIndex
CREATE INDEX "Review_reviewedId_idx" ON "Review"("reviewedId");

-- CreateIndex
CREATE INDEX "Trip_driverCarId_idx" ON "Trip"("driverCarId");

-- CreateIndex
CREATE INDEX "Trip_date_status_idx" ON "Trip"("date", "status");

-- CreateIndex
CREATE INDEX "TripPassenger_tripId_idx" ON "TripPassenger"("tripId");

-- CreateIndex
CREATE INDEX "TripPassenger_passengerId_idx" ON "TripPassenger"("passengerId");

-- CreateIndex
CREATE INDEX "TripPassenger_reservationStatus_idx" ON "TripPassenger"("reservationStatus");

-- CreateIndex
CREATE INDEX "TripPassenger_paymentStatus_idx" ON "TripPassenger"("paymentStatus");

-- CreateIndex
CREATE UNIQUE INDEX "TripPassenger_tripId_passengerId_key" ON "TripPassenger"("tripId", "passengerId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewedId_fkey" FOREIGN KEY ("reviewedId") REFERENCES "User"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_driverCarId_fkey" FOREIGN KEY ("driverCarId") REFERENCES "DriverCar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripPassenger" ADD CONSTRAINT "TripPassenger_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripPassenger" ADD CONSTRAINT "TripPassenger_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "Passenger"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
