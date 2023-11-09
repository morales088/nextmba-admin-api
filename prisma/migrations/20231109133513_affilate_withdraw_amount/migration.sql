/*
  Warnings:

  - The `withdraw_amount` column on the `Affilate_withdraws` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Affilate_withdraws" DROP COLUMN "withdraw_amount",
ADD COLUMN     "withdraw_amount" DECIMAL(9,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Student_courses" ALTER COLUMN "expiration_date" SET DEFAULT NOW() + interval '1 year';
