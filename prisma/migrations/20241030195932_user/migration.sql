/*
  Warnings:

  - You are about to drop the column `mergedFileKey` on the `IdentityCard` table. All the data in the column will be lost.
  - You are about to drop the column `profileImageUrl` on the `User` table. All the data in the column will be lost.
  - Added the required column `fileType` to the `IdentityCard` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('PDF', 'IMAGE');

-- AlterTable
ALTER TABLE "IdentityCard" DROP COLUMN "mergedFileKey",
ADD COLUMN     "fileType" "FileType" NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "profileImageUrl",
ADD COLUMN     "profileImageKey" TEXT;
