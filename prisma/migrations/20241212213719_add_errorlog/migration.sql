-- CreateTable
CREATE TABLE "ErrorLog" (
    "id" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ErrorLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ErrorLog_origin_code_createdAt_idx" ON "ErrorLog"("origin", "code", "createdAt");
