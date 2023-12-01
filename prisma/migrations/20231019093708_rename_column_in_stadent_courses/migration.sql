/*
  Warnings:

  - You are about to drop the column `courseId` on the `Student_courses` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `Student_courses` table. All the data in the column will be lost.
  - Added the required column `course_id` to the `Student_courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_id` to the `Student_courses` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Student_courses" DROP CONSTRAINT "Student_courses_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Student_courses" DROP CONSTRAINT "Student_courses_studentId_fkey";

-- AlterTable
ALTER TABLE "Student_courses" DROP COLUMN "courseId",
DROP COLUMN "studentId",
ADD COLUMN     "course_id" INTEGER NOT NULL,
ADD COLUMN     "student_id" INTEGER NOT NULL,
ALTER COLUMN "expiration_date" SET DEFAULT NOW() + interval '1 year';

-- AddForeignKey
ALTER TABLE "Student_courses" ADD CONSTRAINT "Student_courses_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student_courses" ADD CONSTRAINT "Student_courses_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
