/*
  Warnings:

  - Made the column `remainingSeats` on table `Trip` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Trip" ALTER COLUMN "remainingSeats" SET NOT NULL;
