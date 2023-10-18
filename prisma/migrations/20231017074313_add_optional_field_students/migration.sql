-- AlterTable
ALTER TABLE "Student_courses" ALTER COLUMN "expiration_date" SET DEFAULT NOW() + interval '1 year';

-- AlterTable
ALTER TABLE "Students" ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "country" DROP NOT NULL,
ALTER COLUMN "company" DROP NOT NULL,
ALTER COLUMN "position" DROP NOT NULL,
ALTER COLUMN "industry" DROP NOT NULL;
