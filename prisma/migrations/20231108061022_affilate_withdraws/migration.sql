-- AlterTable
ALTER TABLE "Student_courses" ALTER COLUMN "expiration_date" SET DEFAULT NOW() + interval '1 year';

-- CreateTable
CREATE TABLE "Affilate_withdraws" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "admin_id" INTEGER NOT NULL,
    "withdraw_amount" TEXT NOT NULL,
    "commision_status" INTEGER NOT NULL DEFAULT 1,
    "withdraw_method" TEXT,
    "remarks" TEXT,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Affilate_withdraws_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Affilate_withdraws" ADD CONSTRAINT "Affilate_withdraws_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Affilate_withdraws" ADD CONSTRAINT "Affilate_withdraws_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
