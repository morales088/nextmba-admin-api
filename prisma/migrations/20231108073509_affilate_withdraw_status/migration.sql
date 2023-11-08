/*
  Warnings:

  - You are about to drop the column `commision_status` on the `Affilate_withdraws` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Affilate_withdraws" DROP COLUMN "commision_status";

-- AlterTable
ALTER TABLE "Student_courses" ALTER COLUMN "expiration_date" SET DEFAULT NOW() + interval '1 year';
