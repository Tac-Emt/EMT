-- DropForeignKey
ALTER TABLE "EventOrganizer" DROP CONSTRAINT "EventOrganizer_organizerId_fkey";

-- AddForeignKey
ALTER TABLE "EventOrganizer" ADD CONSTRAINT "EventOrganizer_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
