-- CreateTable
CREATE TABLE "BehavioralEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "taskType" TEXT,
    "plannedTime" DATETIME,
    "executedTime" DATETIME,
    "energyLevel" INTEGER,
    "moodLevel" INTEGER,
    "difficulty" INTEGER,
    "outcome" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "behaviorType" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "expectedValue" INTEGER,
    "timestamp" DATETIME NOT NULL,
    "timezone" TEXT,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT
);

-- CreateTable
CREATE TABLE "LogTag" (
    "logId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    PRIMARY KEY ("logId", "tagId"),
    CONSTRAINT "LogTag_logId_fkey" FOREIGN KEY ("logId") REFERENCES "Log" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LogTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Insight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "behaviorType" TEXT NOT NULL,
    "insights" JSONB NOT NULL,
    "analysis" JSONB NOT NULL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");
