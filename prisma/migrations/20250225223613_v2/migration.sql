/*
  Warnings:

  - The primary key for the `Account` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `accessTokenExpires` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `providerAccountId` on the `Account` table. All the data in the column will be lost.
  - The primary key for the `Session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Session` table. All the data in the column will be lost.
  - The primary key for the `Verification` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `expires` on the `Verification` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Verification` table. All the data in the column will be lost.
  - You are about to drop the column `token` on the `Verification` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Verification` table. All the data in the column will be lost.
  - The required column `_id` was added to the `Account` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `accountId` to the `Account` table without a default value. This is not possible if the table is not empty.
  - The required column `_id` was added to the `Session` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `_id` was added to the `Verification` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `expiresAt` to the `Verification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `Verification` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "Verification" DROP CONSTRAINT "Verification_userId_fkey";

-- DropIndex
DROP INDEX "Account_providerId_providerAccountId_key";

-- DropIndex
DROP INDEX "Session_token_key";

-- DropIndex
DROP INDEX "Verification_token_key";

-- AlterTable
ALTER TABLE "Account" DROP CONSTRAINT "Account_pkey",
DROP COLUMN "accessTokenExpires",
DROP COLUMN "id",
DROP COLUMN "providerAccountId",
ADD COLUMN     "_id" TEXT NOT NULL,
ADD COLUMN     "accessTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "accountId" TEXT NOT NULL,
ADD COLUMN     "password" TEXT,
ADD COLUMN     "refreshTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "scope" TEXT,
ADD CONSTRAINT "Account_pkey" PRIMARY KEY ("_id");

-- AlterTable
ALTER TABLE "Session" DROP CONSTRAINT "Session_pkey",
DROP COLUMN "id",
ADD COLUMN     "_id" TEXT NOT NULL,
ADD COLUMN     "impersonatedBy" TEXT,
ADD CONSTRAINT "Session_pkey" PRIMARY KEY ("_id");

-- AlterTable
ALTER TABLE "Verification" DROP CONSTRAINT "Verification_pkey",
DROP COLUMN "expires",
DROP COLUMN "id",
DROP COLUMN "token",
DROP COLUMN "userId",
ADD COLUMN     "_id" TEXT NOT NULL,
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "value" TEXT NOT NULL,
ADD CONSTRAINT "Verification_pkey" PRIMARY KEY ("_id");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
