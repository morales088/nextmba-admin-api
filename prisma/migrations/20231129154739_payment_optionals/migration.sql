-- AlterTable
ALTER TABLE "Payments" ALTER COLUMN "product_id" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Student_courses" ALTER COLUMN "expiration_date" SET DEFAULT NOW() + interval '1 year';
