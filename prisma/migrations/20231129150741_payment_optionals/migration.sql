-- DropForeignKey
ALTER TABLE "Payments" DROP CONSTRAINT "Payments_product_id_fkey";

-- AlterTable
ALTER TABLE "Payments" ALTER COLUMN "product_id" DROP NOT NULL,
ALTER COLUMN "product_code" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Student_courses" ALTER COLUMN "expiration_date" SET DEFAULT NOW() + interval '1 year';

-- AddForeignKey
ALTER TABLE "Payments" ADD CONSTRAINT "Payments_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
