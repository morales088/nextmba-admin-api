-- AlterTable
ALTER TABLE "Student_courses" ALTER COLUMN "expiration_date" SET DEFAULT NOW() + interval '1 year';

-- CreateTable
CREATE TABLE "Affiliates" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "admin_id" INTEGER NOT NULL,
    "affiliate" TEXT NOT NULL,
    "affiliate_status" INTEGER NOT NULL DEFAULT 1,
    "percentage" DECIMAL(9,2) NOT NULL DEFAULT 0,
    "remarks" TEXT,
    "withdraw_method" TEXT,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Affiliates_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Affiliates" ADD CONSTRAINT "Affiliates_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Affiliates" ADD CONSTRAINT "Affiliates_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
