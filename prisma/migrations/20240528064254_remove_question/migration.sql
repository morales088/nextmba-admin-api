/*
  Warnings:

  - You are about to drop the column `question_id` on the `Quiz` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_question_id_fkey";

-- AlterTable
ALTER TABLE "Quiz" DROP COLUMN "question_id";
