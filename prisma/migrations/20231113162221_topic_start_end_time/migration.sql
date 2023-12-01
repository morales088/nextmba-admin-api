/*
  Warnings:

  - The `end_time` column on the `Topics` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `start_time` column on the `Topics` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Student_courses" ALTER COLUMN "expiration_date" SET DEFAULT NOW() + interval '1 year';

-- AlterTable
ALTER TABLE "Topics" DROP COLUMN "end_time",
ADD COLUMN     "end_time" TIMESTAMP(3),
DROP COLUMN "start_time",
ADD COLUMN     "start_time" TIMESTAMP(3);
