/*
  Warnings:

  - Added the required column `group_id` to the `Student_group_member` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Student_group_member" ADD COLUMN     "group_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Student_group_member" ADD CONSTRAINT "Student_group_member_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Student_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
