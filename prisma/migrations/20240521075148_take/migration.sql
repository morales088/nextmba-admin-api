-- CreateTable
CREATE TABLE "Take" (
    "id" SERIAL NOT NULL,
    "quiz_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Take_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Take" ADD CONSTRAINT "Take_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Take" ADD CONSTRAINT "Take_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
