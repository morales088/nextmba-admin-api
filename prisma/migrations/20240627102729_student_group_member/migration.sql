-- DropForeignKey
ALTER TABLE "Student_groups" DROP CONSTRAINT "Student_groups_course_id_fkey";

-- AlterTable
ALTER TABLE "Student_groups" ALTER COLUMN "course_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Student_groups" ADD CONSTRAINT "Student_groups_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
