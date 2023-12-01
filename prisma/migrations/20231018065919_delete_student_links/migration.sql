/*
  Warnings:

  - You are about to drop the `Student_links` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Student_links" DROP CONSTRAINT "Student_links_studentId_fkey";

-- AlterTable
ALTER TABLE "Student_courses" ALTER COLUMN "expiration_date" SET DEFAULT NOW() + interval '1 year';

-- DropTable
DROP TABLE "Student_links";
