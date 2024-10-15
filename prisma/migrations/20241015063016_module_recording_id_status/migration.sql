-- AlterTable
ALTER TABLE "Modules" ADD COLUMN     "recording_id" TEXT,
ADD COLUMN     "recording_status" BOOLEAN NOT NULL DEFAULT false;
