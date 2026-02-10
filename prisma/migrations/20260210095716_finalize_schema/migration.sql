/*
  Warnings:

  - You are about to drop the column `behaviorType` on the `Insight` table. All the data in the column will be lost.
  - Added the required column `message` to the `Insight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priority` to the `Insight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Insight` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Insight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "recommendation" TEXT,
    "priority" TEXT NOT NULL,
    "confidence" REAL,
    "insights" JSONB NOT NULL,
    "analysis" JSONB NOT NULL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Insight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Insight" ("analysis", "createdAt", "generatedAt", "id", "insights") SELECT "analysis", "createdAt", "generatedAt", "id", "insights" FROM "Insight";
DROP TABLE "Insight";
ALTER TABLE "new_Insight" RENAME TO "Insight";
CREATE INDEX "Insight_userId_generatedAt_idx" ON "Insight"("userId", "generatedAt");
CREATE TABLE "new_Log" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "behaviorType" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "expectedValue" INTEGER,
    "timestamp" DATETIME NOT NULL,
    "timezone" TEXT,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Log" ("behaviorType", "createdAt", "expectedValue", "id", "note", "timestamp", "timezone", "userId", "value") SELECT "behaviorType", "createdAt", "expectedValue", "id", "note", "timestamp", "timezone", "userId", "value" FROM "Log";
DROP TABLE "Log";
ALTER TABLE "new_Log" RENAME TO "Log";
CREATE INDEX "Log_userId_createdAt_idx" ON "Log"("userId", "createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
