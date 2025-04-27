/*
  Warnings:

  - You are about to drop the column `organizerId` on the `Event` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_organizerId_fkey";

-- DropIndex
DROP INDEX "Event_organizerId_idx";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "organizerId",
ADD COLUMN     "isCollaborative" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "EventOrganizer" (
    "eventId" INTEGER NOT NULL,
    "organizerId" INTEGER NOT NULL,
    "isHost" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventOrganizer_pkey" PRIMARY KEY ("eventId","organizerId")
);

-- CreateTable
CREATE TABLE "EventInvitation" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "inviteeId" INTEGER NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventOrganizer_eventId_idx" ON "EventOrganizer"("eventId");

-- CreateIndex
CREATE INDEX "EventOrganizer_organizerId_idx" ON "EventOrganizer"("organizerId");

-- CreateIndex
CREATE INDEX "EventInvitation_eventId_idx" ON "EventInvitation"("eventId");

-- CreateIndex
CREATE INDEX "EventInvitation_inviteeId_idx" ON "EventInvitation"("inviteeId");

-- CreateIndex
CREATE UNIQUE INDEX "EventInvitation_eventId_inviteeId_key" ON "EventInvitation"("eventId", "inviteeId");

-- CreateIndex
CREATE INDEX "Event_isCollaborative_idx" ON "Event"("isCollaborative");

-- AddForeignKey
ALTER TABLE "EventOrganizer" ADD CONSTRAINT "EventOrganizer_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventOrganizer" ADD CONSTRAINT "EventOrganizer_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventInvitation" ADD CONSTRAINT "EventInvitation_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventInvitation" ADD CONSTRAINT "EventInvitation_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
