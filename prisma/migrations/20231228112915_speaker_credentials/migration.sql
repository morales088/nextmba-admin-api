-- AlterTable
ALTER TABLE "Speakers" ADD COLUMN     "email" TEXT DEFAULT '',
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "password" TEXT DEFAULT '';

-- AlterTable
ALTER TABLE "Student_courses" ALTER COLUMN "expiration_date" SET DEFAULT NOW() + interval '1 year';
