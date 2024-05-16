-- DropForeignKey
ALTER TABLE "Assignments" DROP CONSTRAINT "Assignments_module_id_fkey";

-- AlterTable
ALTER TABLE "Assignments" ALTER COLUMN "module_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Assignments" ADD CONSTRAINT "Assignments_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "Modules"("id") ON DELETE SET NULL ON UPDATE CASCADE;
