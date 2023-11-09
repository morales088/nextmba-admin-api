/*
  Warnings:

  - You are about to drop the column `withdraw_method` on the `Affilate_withdraws` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Affilate_withdraws" DROP COLUMN "withdraw_method",
ADD COLUMN     "withdrawal_info" TEXT;

-- AlterTable
ALTER TABLE "Student_courses" ALTER COLUMN "expiration_date" SET DEFAULT NOW() + interval '1 year';
