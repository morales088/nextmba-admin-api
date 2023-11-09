/*
  Warnings:

  - You are about to drop the column `status` on the `Affiliates` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Affiliates" DROP COLUMN "status",
ALTER COLUMN "affiliate_status" SET DEFAULT 2;

-- AlterTable
ALTER TABLE "Student_courses" ALTER COLUMN "expiration_date" SET DEFAULT NOW() + interval '1 year';
