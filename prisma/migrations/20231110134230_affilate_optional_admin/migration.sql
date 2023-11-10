-- DropForeignKey
ALTER TABLE "Affilate_withdraws" DROP CONSTRAINT "Affilate_withdraws_admin_id_fkey";

-- DropForeignKey
ALTER TABLE "Affiliates" DROP CONSTRAINT "Affiliates_admin_id_fkey";

-- AlterTable
ALTER TABLE "Affilate_withdraws" ALTER COLUMN "admin_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Affiliates" ALTER COLUMN "admin_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Student_courses" ALTER COLUMN "expiration_date" SET DEFAULT NOW() + interval '1 year';

-- AddForeignKey
ALTER TABLE "Affiliates" ADD CONSTRAINT "Affiliates_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Affilate_withdraws" ADD CONSTRAINT "Affilate_withdraws_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
