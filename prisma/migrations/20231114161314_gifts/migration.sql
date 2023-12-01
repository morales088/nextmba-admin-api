-- AlterTable
ALTER TABLE "Student_courses" ALTER COLUMN "expiration_date" SET DEFAULT NOW() + interval '1 year';

-- CreateTable
CREATE TABLE "Gifts" (
    "id" SERIAL NOT NULL,
    "from_student_id" INTEGER NOT NULL,
    "payment_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "recipient" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Gifts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Gifts" ADD CONSTRAINT "Gifts_from_student_id_fkey" FOREIGN KEY ("from_student_id") REFERENCES "Students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gifts" ADD CONSTRAINT "Gifts_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "Payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gifts" ADD CONSTRAINT "Gifts_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
