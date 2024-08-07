/*
  Warnings:

  - You are about to drop the column `module_id` on the `Questions` table. All the data in the column will be lost.
  - You are about to drop the `Quiz_questions` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `quiz_id` to the `Questions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Questions" DROP CONSTRAINT "Questions_module_id_fkey";

-- DropForeignKey
ALTER TABLE "Quiz_questions" DROP CONSTRAINT "Quiz_questions_question_id_fkey";

-- DropForeignKey
ALTER TABLE "Quiz_questions" DROP CONSTRAINT "Quiz_questions_quiz_id_fkey";

-- AlterTable
ALTER TABLE "Questions" DROP COLUMN "module_id",
ADD COLUMN     "quiz_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Quiz_questions";

-- AddForeignKey
ALTER TABLE "Questions" ADD CONSTRAINT "Questions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
