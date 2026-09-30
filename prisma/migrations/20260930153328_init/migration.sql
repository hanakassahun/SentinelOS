-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "plannedStart" DATETIME NOT NULL,
    "timezone" TEXT NOT NULL,
    "localHour" INTEGER NOT NULL,
    "localWeekday" INTEGER NOT NULL,
    "cognitiveLoad" INTEGER,
    "plannedMinutes" INTEGER,
    "actualStart" DATETIME,
    "actualMinutes" INTEGER,
    "energyAtStart" INTEGER,
    "moodAtStart" INTEGER,
    "outcome" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CheckIn" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "predictedValue" INTEGER,
    "timestamp" DATETIME NOT NULL,
    "timezone" TEXT,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CheckIn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    CONSTRAINT "Tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TaskTag" (
    "taskId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    PRIMARY KEY ("taskId", "tagId"),
    CONSTRAINT "TaskTag_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TaskTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CheckInTag" (
    "checkInId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    PRIMARY KEY ("checkInId", "tagId"),
    CONSTRAINT "CheckInTag_checkInId_fkey" FOREIGN KEY ("checkInId") REFERENCES "CheckIn" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CheckInTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Insight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "dedupeKey" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "recommendation" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "confidence" REAL,
    "sampleSize" INTEGER NOT NULL,
    "windowStart" DATETIME,
    "windowEnd" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "evidence" JSONB NOT NULL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Insight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Decision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tags" TEXT,
    "riskScore" INTEGER NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Decision_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DecisionLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "context" JSONB NOT NULL,
    "outcome" TEXT NOT NULL,
    "productivityDrop" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DecisionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Task_userId_plannedStart_idx" ON "Task"("userId", "plannedStart");

-- CreateIndex
CREATE INDEX "Task_userId_outcome_localHour_idx" ON "Task"("userId", "outcome", "localHour");

-- CreateIndex
CREATE INDEX "Task_userId_outcome_localWeekday_idx" ON "Task"("userId", "outcome", "localWeekday");

-- CreateIndex
CREATE INDEX "CheckIn_userId_createdAt_idx" ON "CheckIn"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "CheckIn_userId_kind_timestamp_idx" ON "CheckIn"("userId", "kind", "timestamp");

-- CreateIndex
CREATE INDEX "Tag_userId_idx" ON "Tag"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_userId_name_key" ON "Tag"("userId", "name");

-- CreateIndex
CREATE INDEX "TaskTag_tagId_idx" ON "TaskTag"("tagId");

-- CreateIndex
CREATE INDEX "CheckInTag_tagId_idx" ON "CheckInTag"("tagId");

-- CreateIndex
CREATE INDEX "Insight_userId_generatedAt_idx" ON "Insight"("userId", "generatedAt");

-- CreateIndex
CREATE INDEX "Insight_userId_status_idx" ON "Insight"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Insight_userId_dedupeKey_key" ON "Insight"("userId", "dedupeKey");

-- CreateIndex
CREATE INDEX "Decision_userId_createdAt_idx" ON "Decision"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "DecisionLog_userId_createdAt_idx" ON "DecisionLog"("userId", "createdAt");
