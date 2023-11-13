-- AlterTable
ALTER TABLE "Student_courses" ALTER COLUMN "expiration_date" SET DEFAULT NOW() + interval '1 year';

-- AlterTable
ALTER TABLE "Topics" ADD COLUMN     "end_time" TIME,
ADD COLUMN     "start_time" TIME;
