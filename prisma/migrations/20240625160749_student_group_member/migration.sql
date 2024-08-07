/*
  Warnings:

  - You are about to drop the `Student_group_memmber` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Student_group_memmber" DROP CONSTRAINT "Student_group_memmber_student_id_fkey";

-- DropTable
DROP TABLE "Student_group_memmber";

-- CreateTable
CREATE TABLE "Student_group_member" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Student_group_member_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Student_group_member" ADD CONSTRAINT "Student_group_member_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
