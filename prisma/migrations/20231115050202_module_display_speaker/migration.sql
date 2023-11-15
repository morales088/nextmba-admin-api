/*
  Warnings:

  - You are about to drop the column `linkendIn` on the `Students` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Modules" ADD COLUMN     "display_speaker" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Student_courses" ALTER COLUMN "expiration_date" SET DEFAULT NOW() + interval '1 year';

-- AlterTable
ALTER TABLE "Students" DROP COLUMN "linkendIn",
ADD COLUMN     "linkedIn" TEXT;
