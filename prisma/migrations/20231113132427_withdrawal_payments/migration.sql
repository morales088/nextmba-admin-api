-- AlterTable
ALTER TABLE "Student_courses" ALTER COLUMN "expiration_date" SET DEFAULT NOW() + interval '1 year';

-- CreateTable
CREATE TABLE "Withdrawal_payments" (
    "id" SERIAL NOT NULL,
    "withdrawal_id" INTEGER NOT NULL,
    "payment_id" INTEGER NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Withdrawal_payments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Withdrawal_payments" ADD CONSTRAINT "Withdrawal_payments_withdrawal_id_fkey" FOREIGN KEY ("withdrawal_id") REFERENCES "Affilate_withdraws"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Withdrawal_payments" ADD CONSTRAINT "Withdrawal_payments_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "Payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
