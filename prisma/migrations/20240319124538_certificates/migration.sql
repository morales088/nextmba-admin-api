/*
  Warnings:

  - You are about to drop the column `certificate_id` on the `Certificates` table. All the data in the column will be lost.
  - You are about to drop the column `course_id` on the `Certificates` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Certificates" DROP CONSTRAINT "Certificates_course_id_fkey";

-- AlterTable
ALTER TABLE "Certificates" DROP COLUMN "certificate_id",
DROP COLUMN "course_id";
