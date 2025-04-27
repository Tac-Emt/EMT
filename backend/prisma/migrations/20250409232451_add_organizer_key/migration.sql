/*
  Warnings:

  - A unique constraint covering the columns `[organizerKey]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "status" "EventStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "organizerKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_organizerKey_key" ON "User"("organizerKey");
