/*
  Warnings:

  - You are about to drop the column `zoom_link` on the `Modules` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Modules" DROP COLUMN "zoom_link",
ADD COLUMN     "live_link" TEXT;

-- AlterTable
ALTER TABLE "Student_courses" ALTER COLUMN "expiration_date" SET DEFAULT NOW() + interval '1 year';
