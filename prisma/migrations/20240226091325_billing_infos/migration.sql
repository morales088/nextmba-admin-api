-- CreateTable
CREATE TABLE "Billing_infos" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "notes" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Billing_infos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Billing_infos" ADD CONSTRAINT "Billing_infos_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
