/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Students` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Student_courses" ALTER COLUMN "expiration_date" SET DEFAULT NOW() + interval '1 year';

-- CreateIndex
CREATE UNIQUE INDEX "Students_email_key" ON "Students"("email");
