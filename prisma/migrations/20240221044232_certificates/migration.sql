-- CreateTable
CREATE TABLE "Certificates" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "certificate_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "template" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Certificates_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Certificates" ADD CONSTRAINT "Certificates_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
