/*
  Warnings:

  - You are about to drop the column `chat_moderator` on the `Students` table. All the data in the column will be lost.
  - You are about to drop the column `forgot_password_code` on the `Students` table. All the data in the column will be lost.
  - Added the required column `industry` to the `Students` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Student_courses" ALTER COLUMN "expiration_date" SET DEFAULT NOW() + interval '1 year';

-- AlterTable
ALTER TABLE "Students" DROP COLUMN "chat_moderator",
DROP COLUMN "forgot_password_code",
ADD COLUMN     "industry" TEXT NOT NULL;
