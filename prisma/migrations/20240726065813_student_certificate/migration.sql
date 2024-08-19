-- AlterTable
ALTER TABLE "Student_certificates" ADD COLUMN     "module_id" INTEGER DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Student_certificates" ADD CONSTRAINT "Student_certificates_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "Modules"("id") ON DELETE SET NULL ON UPDATE CASCADE;
