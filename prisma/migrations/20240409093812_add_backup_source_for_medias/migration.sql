-- AlterTable
ALTER TABLE "Medias" ADD COLUMN     "backup_source" INTEGER DEFAULT 1,
ADD COLUMN     "backup_source_code" VARCHAR(255);
