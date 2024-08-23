/*
  Warnings:

  - You are about to drop the column `published_date` on the `Quiz` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Quiz" DROP COLUMN "published_date",
ADD COLUMN     "deadline" TEXT;
