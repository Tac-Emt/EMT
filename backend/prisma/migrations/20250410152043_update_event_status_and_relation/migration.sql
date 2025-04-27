/*
  Warnings:

  - You are about to drop the column `organizerKey` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_organizerKey_key";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "image" TEXT,
ADD COLUMN     "location" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "organizerKey";
