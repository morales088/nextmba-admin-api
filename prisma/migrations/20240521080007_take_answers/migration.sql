/*
  Warnings:

  - You are about to drop the `Take` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Take" DROP CONSTRAINT "Take_quiz_id_fkey";

-- DropForeignKey
ALTER TABLE "Take" DROP CONSTRAINT "Take_student_id_fkey";

-- DropTable
DROP TABLE "Take";

-- CreateTable
CREATE TABLE "Takes" (
    "id" SERIAL NOT NULL,
    "quiz_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Takes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Take_asnwers" (
    "id" SERIAL NOT NULL,
    "take_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "answer_id" INTEGER NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Take_asnwers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Takes" ADD CONSTRAINT "Takes_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Takes" ADD CONSTRAINT "Takes_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Take_asnwers" ADD CONSTRAINT "Take_asnwers_take_id_fkey" FOREIGN KEY ("take_id") REFERENCES "Takes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Take_asnwers" ADD CONSTRAINT "Take_asnwers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Take_asnwers" ADD CONSTRAINT "Take_asnwers_answer_id_fkey" FOREIGN KEY ("answer_id") REFERENCES "Answers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
