/*
  Migration: fix_user_event_relation
  Purpose: Add category, type, and eventTag to Event table, make organizerId required, and add indexes.
*/

-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('CS', 'RAS', 'IAS', 'WIE');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('CONGRESS', 'CONFERENCE', 'HACKATHON', 'NORMAL', 'ONLINE');

-- Step 1: Update NULL organizerId values to a valid User ID
UPDATE "Event" SET "organizerId" = 1 WHERE "organizerId" IS NULL;

-- Step 2: Drop existing foreign key
ALTER TABLE "Event" DROP CONSTRAINT "Event_organizerId_fkey";

-- Step 3: Add new columns as nullable
ALTER TABLE "Event" 
ADD COLUMN "category" "EventCategory",
ADD COLUMN "type" "EventType",
ADD COLUMN "eventTag" TEXT;

-- Step 4: Backfill default values for existing rows
UPDATE "Event" 
SET "category" = 'CS', 
    "type" = 'NORMAL', 
    "eventTag" = 'CS-NORMAL'
WHERE "category" IS NULL OR "type" IS NULL OR "eventTag" IS NULL;

-- Step 5: Set columns to NOT NULL
ALTER TABLE "Event" 
ALTER COLUMN "category" SET NOT NULL,
ALTER COLUMN "type" SET NOT NULL,
ALTER COLUMN "eventTag" SET NOT NULL;

-- Step 6: Make organizerId NOT NULL
ALTER TABLE "Event" 
ALTER COLUMN "organizerId" SET NOT NULL;

-- Step 7: Add foreign key back
ALTER TABLE "Event" 
ADD CONSTRAINT "Event_organizerId_fkey" 
FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 8: Create indexes
CREATE INDEX "Event_organizerId_idx" ON "Event"("organizerId");
CREATE INDEX "Event_date_idx" ON "Event"("date");
CREATE INDEX "Event_eventTag_idx" ON "Event"("eventTag");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");