-- DropForeignKey
ALTER TABLE "Subscriber_groups" DROP CONSTRAINT "Subscriber_groups_course_id_fkey";

-- AlterTable
ALTER TABLE "Subscriber_groups" ALTER COLUMN "course_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Subscriber_groups" ADD CONSTRAINT "Subscriber_groups_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
