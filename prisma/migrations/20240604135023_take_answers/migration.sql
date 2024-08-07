/*
  Warnings:

  - You are about to drop the `Take_asnwers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Take_asnwers" DROP CONSTRAINT "Take_asnwers_answer_id_fkey";

-- DropForeignKey
ALTER TABLE "Take_asnwers" DROP CONSTRAINT "Take_asnwers_question_id_fkey";

-- DropForeignKey
ALTER TABLE "Take_asnwers" DROP CONSTRAINT "Take_asnwers_take_id_fkey";

-- DropTable
DROP TABLE "Take_asnwers";

-- CreateTable
CREATE TABLE "Take_answers" (
    "id" SERIAL NOT NULL,
    "take_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "answer_id" INTEGER NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Take_answers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Take_answers" ADD CONSTRAINT "Take_answers_take_id_fkey" FOREIGN KEY ("take_id") REFERENCES "Takes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Take_answers" ADD CONSTRAINT "Take_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Take_answers" ADD CONSTRAINT "Take_answers_answer_id_fkey" FOREIGN KEY ("answer_id") REFERENCES "Answers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
