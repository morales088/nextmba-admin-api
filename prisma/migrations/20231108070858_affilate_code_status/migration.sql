/*
  Warnings:

  - You are about to drop the column `affiliate` on the `Affiliates` table. All the data in the column will be lost.
  - You are about to drop the column `affiliate_status` on the `Affiliates` table. All the data in the column will be lost.
  - Added the required column `code` to the `Affiliates` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Affiliates" DROP COLUMN "affiliate",
DROP COLUMN "affiliate_status",
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "status" INTEGER NOT NULL DEFAULT 2;

-- AlterTable
ALTER TABLE "Student_courses" ALTER COLUMN "expiration_date" SET DEFAULT NOW() + interval '1 year';
