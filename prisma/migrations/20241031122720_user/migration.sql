/*
  Warnings:

  - Added the required column `idNumber` to the `IdentityCard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "IdentityCard" ADD COLUMN     "idNumber" INTEGER NOT NULL;
