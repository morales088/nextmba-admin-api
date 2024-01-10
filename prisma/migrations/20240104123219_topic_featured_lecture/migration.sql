-- AlterTable
ALTER TABLE "Student_courses" ALTER COLUMN "expiration_date" SET DEFAULT NOW() + interval '1 year';

-- AlterTable
ALTER TABLE "Topics" ADD COLUMN     "featured_lecture" BOOLEAN NOT NULL DEFAULT false;
