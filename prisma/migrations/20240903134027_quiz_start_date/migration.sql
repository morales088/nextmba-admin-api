/*
  Warnings:

  - The `deadline` column on the `Quiz` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "start_date" TIMESTAMP(3),
DROP COLUMN "deadline",
ADD COLUMN     "deadline" TIMESTAMP(3);
