/*
  Warnings:

  - You are about to drop the column `isCollaborative` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the `EventInvitation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EventInvitation" DROP CONSTRAINT "EventInvitation_eventId_fkey";

-- DropForeignKey
ALTER TABLE "EventInvitation" DROP CONSTRAINT "EventInvitation_inviteeId_fkey";

-- DropIndex
DROP INDEX "Event_isCollaborative_idx";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "isCollaborative";

-- DropTable
DROP TABLE "EventInvitation";

-- DropEnum
DROP TYPE "InvitationStatus";
