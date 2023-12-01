-- AlterTable
ALTER TABLE "Student_courses" ADD COLUMN     "module_quantity" INTEGER NOT NULL DEFAULT 12,
ALTER COLUMN "expiration_date" SET DEFAULT NOW() + interval '1 year';
