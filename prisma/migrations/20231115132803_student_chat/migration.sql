-- AlterTable
ALTER TABLE "Student_courses" ALTER COLUMN "expiration_date" SET DEFAULT NOW() + interval '1 year';

-- AlterTable
ALTER TABLE "Students" ADD COLUMN     "chat_access" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "chat_moderator" BOOLEAN NOT NULL DEFAULT false;
