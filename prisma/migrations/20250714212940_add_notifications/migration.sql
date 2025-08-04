-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('VERIFICATION_APPROVED', 'VERIFICATION_FAILED', 'LICENSE_VERIFIED', 'LICENSE_FAILED', 'VEHICLE_CARD_VERIFIED', 'VEHICLE_CARD_FAILED', 'INSURANCE_VERIFIED', 'INSURANCE_FAILED', 'PHONE_VERIFIED', 'PROFILE_UPDATED', 'PASSWORD_CHANGED', 'CAR_ADDED', 'CAR_REMOVED', 'TRIP_CREATED', 'TRIP_CANCELLED', 'RESERVATION_RECEIVED', 'RESERVATION_APPROVED', 'RESERVATION_REJECTED', 'RESERVATION_CANCELLED', 'TRIP_COMPLETED', 'PAYMENT_RECEIVED', 'PAYMENT_COMPLETED', 'PAYMENT_FAILED', 'ACCOUNT_BANNED', 'ACCOUNT_UNBANNED', 'SYSTEM_MAINTENANCE');

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "stateUpdate" JSONB NOT NULL,
    "data" JSONB,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_read_createdAt_idx" ON "Notification"("userId", "read", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_type_idx" ON "Notification"("userId", "type");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("_id") ON DELETE CASCADE ON UPDATE CASCADE;
