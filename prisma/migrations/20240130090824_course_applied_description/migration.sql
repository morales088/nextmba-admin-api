/*
  Warnings:

  - You are about to drop the column `apllied_studies_description` on the `Courses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Courses" DROP COLUMN "apllied_studies_description",
ADD COLUMN     "applied_studies_description" TEXT;
