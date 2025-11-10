-- CreateTable
CREATE TABLE "ChatHistory" (
    "id" TEXT NOT NULL,
    "userQuery" TEXT NOT NULL,
    "generatedSql" TEXT NOT NULL,
    "resultCount" INTEGER NOT NULL,
    "success" BOOLEAN NOT NULL,
    "userIp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatHistory_createdAt_idx" ON "ChatHistory"("createdAt");

-- CreateIndex
CREATE INDEX "ChatHistory_success_idx" ON "ChatHistory"("success");
