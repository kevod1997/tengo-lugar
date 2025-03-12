-- AlterTable
ALTER TABLE "User" ADD COLUMN     "banExpires" INTEGER,
ADD COLUMN     "banReason" TEXT,
ADD COLUMN     "banned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user';
