/*
  Warnings:

  - You are about to drop the `Idividual_submissions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Idividual_submissions" DROP CONSTRAINT "Idividual_submissions_assignment_id_fkey";

-- DropForeignKey
ALTER TABLE "Idividual_submissions" DROP CONSTRAINT "Idividual_submissions_submitted_by_fkey";

-- DropTable
DROP TABLE "Idividual_submissions";

-- CreateTable
CREATE TABLE "Individual_submissions" (
    "id" SERIAL NOT NULL,
    "assignment_id" INTEGER NOT NULL,
    "submitted_by" INTEGER NOT NULL,
    "submission_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "answer_details" TEXT,
    "answer_feedback" TEXT,
    "status" INTEGER NOT NULL DEFAULT 2,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Individual_submissions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Individual_submissions" ADD CONSTRAINT "Individual_submissions_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "Assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Individual_submissions" ADD CONSTRAINT "Individual_submissions_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "Students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
