/*
  Warnings:

  - The values [CONGRESS,CONFERENCE,HACKATHON,NORMAL,ONLINE] on the enum `EventType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EventType_new" AS ENUM ('CS', 'IAS', 'WIE', 'RAS');
ALTER TABLE "Event" ALTER COLUMN "type" TYPE "EventType_new" USING ("type"::text::"EventType_new");
ALTER TYPE "EventType" RENAME TO "EventType_old";
ALTER TYPE "EventType_new" RENAME TO "EventType";
DROP TYPE "EventType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "endDate" TIMESTAMP(3);
