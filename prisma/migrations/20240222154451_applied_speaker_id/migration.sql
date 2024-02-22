-- AlterTable
ALTER TABLE "Applied_studies" ADD COLUMN     "speaker_id" INTEGER;

-- AddForeignKey
ALTER TABLE "Applied_studies" ADD CONSTRAINT "Applied_studies_speaker_id_fkey" FOREIGN KEY ("speaker_id") REFERENCES "Speakers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
