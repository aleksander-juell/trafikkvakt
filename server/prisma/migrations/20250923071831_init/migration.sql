-- CreateTable
CREATE TABLE "Parent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Child" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Child_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Parent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Crossing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Week" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Duty" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "crossingId" TEXT NOT NULL,
    "parentId" TEXT,
    "weekId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'assigned',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Duty_crossingId_fkey" FOREIGN KEY ("crossingId") REFERENCES "Crossing" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Duty_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Parent" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Duty_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "Week" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DutySwap" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromDutyId" TEXT NOT NULL,
    "toDutyId" TEXT NOT NULL,
    "fromParentId" TEXT NOT NULL,
    "toParentId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Parent_email_key" ON "Parent"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Week_year_weekNumber_key" ON "Week"("year", "weekNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Duty_crossingId_weekId_dayOfWeek_timeSlot_key" ON "Duty"("crossingId", "weekId", "dayOfWeek", "timeSlot");
