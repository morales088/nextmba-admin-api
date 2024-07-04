-- AlterTable
ALTER TABLE "Questions" ALTER COLUMN "description" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Answers" (
    "id" SERIAL NOT NULL,
    "question_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "correct" INTEGER NOT NULL DEFAULT 1,
    "active" INTEGER NOT NULL DEFAULT 1,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Answers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Answers" ADD CONSTRAINT "Answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
