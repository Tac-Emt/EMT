-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SPEAKER';

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "registrationLink" TEXT;
