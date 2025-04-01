/*
  Warnings:

  - You are about to drop the column `destination` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `origin` on the `Trip` table. All the data in the column will be lost.
  - Added the required column `destinationCity` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `destinationProvince` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originCity` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originProvince` to the `Trip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Trip" DROP COLUMN "destination",
DROP COLUMN "origin",
ADD COLUMN     "destinationAddress" TEXT,
ADD COLUMN     "destinationCity" TEXT NOT NULL,
ADD COLUMN     "destinationLatitude" DOUBLE PRECISION,
ADD COLUMN     "destinationLongitude" DOUBLE PRECISION,
ADD COLUMN     "destinationProvince" TEXT NOT NULL,
ADD COLUMN     "duration" TEXT,
ADD COLUMN     "durationSeconds" INTEGER,
ADD COLUMN     "googleMapsUrl" TEXT,
ADD COLUMN     "hasTolls" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "originAddress" TEXT,
ADD COLUMN     "originCity" TEXT NOT NULL,
ADD COLUMN     "originLatitude" DOUBLE PRECISION,
ADD COLUMN     "originLongitude" DOUBLE PRECISION,
ADD COLUMN     "originProvince" TEXT NOT NULL,
ADD COLUMN     "tollEstimatedPrice" DOUBLE PRECISION;
