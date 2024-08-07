/*
  Warnings:

  - Added the required column `module_id` to the `Questions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Questions" ADD COLUMN     "module_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Questions" ADD CONSTRAINT "Questions_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "Modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
