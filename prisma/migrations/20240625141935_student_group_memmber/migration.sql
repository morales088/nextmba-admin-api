-- CreateTable
CREATE TABLE "Student_group_memmber" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Student_group_memmber_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Student_group_memmber" ADD CONSTRAINT "Student_group_memmber_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
