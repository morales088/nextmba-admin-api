-- AlterTable
ALTER TABLE "Student_courses" ALTER COLUMN "expiration_date" SET DEFAULT NOW() + interval '1 year';

-- AlterTable
ALTER TABLE "Students" ADD COLUMN     "library_access" INTEGER NOT NULL DEFAULT 0;
