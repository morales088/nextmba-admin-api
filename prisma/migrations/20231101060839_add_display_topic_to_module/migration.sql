-- AlterTable
ALTER TABLE "Modules" ADD COLUMN     "display_topic" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Student_courses" ALTER COLUMN "expiration_date" SET DEFAULT NOW() + interval '1 year';
