-- AlterTable
ALTER TABLE "Modules" ADD COLUMN     "live_id" TEXT;

-- AlterTable
ALTER TABLE "Student_courses" ALTER COLUMN "expiration_date" SET DEFAULT NOW() + interval '1 year';
