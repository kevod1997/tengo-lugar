/*
  Warnings:

  - A unique constraint covering the columns `[chatRoomId]` on the table `Trip` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "chatRoomId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Trip_chatRoomId_key" ON "Trip"("chatRoomId");
