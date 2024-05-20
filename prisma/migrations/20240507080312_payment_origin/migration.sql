/*
  Warnings:

  - You are about to drop the column `from` on the `Payments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Payments" DROP COLUMN "from",
ADD COLUMN     "origin" INTEGER NOT NULL DEFAULT 1;
