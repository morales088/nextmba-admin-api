-- AlterTable
ALTER TABLE "Topics" ADD COLUMN     "applied_study_id" INTEGER DEFAULT 0;

-- CreateTable
CREATE TABLE "Applied_studies" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "cover_photo" TEXT,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Applied_studies_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Topics" ADD CONSTRAINT "Topics_applied_study_id_fkey" FOREIGN KEY ("applied_study_id") REFERENCES "Applied_studies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Applied_studies" ADD CONSTRAINT "Applied_studies_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
