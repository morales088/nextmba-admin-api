-- AlterTable
ALTER TABLE "Student_courses" ALTER COLUMN "expiration_date" SET DEFAULT NOW() + interval '1 year';

-- AlterTable
ALTER TABLE "Students" ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "linkendIn" TEXT,
ADD COLUMN     "telegram" TEXT,
ADD COLUMN     "website" TEXT;
