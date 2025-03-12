/*
  Warnings:

  - You are about to drop the column `idToken` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumberVerified` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "idToken";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "phoneNumber",
DROP COLUMN "phoneNumberVerified";
