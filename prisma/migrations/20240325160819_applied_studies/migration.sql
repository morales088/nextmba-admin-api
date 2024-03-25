-- AddForeignKey
ALTER TABLE "Topics" ADD CONSTRAINT "Topics_applied_study_id_fkey" FOREIGN KEY ("applied_study_id") REFERENCES "Applied_studies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
