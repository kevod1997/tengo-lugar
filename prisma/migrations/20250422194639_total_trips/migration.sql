-- AlterTable
ALTER TABLE "Driver" ADD COLUMN     "totalTrips" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Passenger" ADD COLUMN     "totalTrips" INTEGER NOT NULL DEFAULT 0;
