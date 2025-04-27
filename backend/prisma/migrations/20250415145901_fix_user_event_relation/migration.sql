/*
  Warnings:

  - The values [ARCHIVED] on the enum `EventStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EventStatus_new" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED');
ALTER TABLE "Event" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Event" ALTER COLUMN "status" TYPE "EventStatus_new" USING ("status"::text::"EventStatus_new");
ALTER TYPE "EventStatus" RENAME TO "EventStatus_old";
ALTER TYPE "EventStatus_new" RENAME TO "EventStatus";
DROP TYPE "EventStatus_old";
ALTER TABLE "Event" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- DropIndex
DROP INDEX "Event_date_idx";

-- DropIndex
DROP INDEX "Event_eventTag_idx";

-- DropIndex
DROP INDEX "EventOrganizer_eventId_idx";

-- DropIndex
DROP INDEX "EventOrganizer_organizerId_idx";

-- DropIndex
DROP INDEX "User_email_idx";

-- DropIndex
DROP INDEX "User_role_idx";

-- AlterTable
ALTER TABLE "EventOrganizer" ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "pendingConfirmation" BOOLEAN NOT NULL DEFAULT false;
