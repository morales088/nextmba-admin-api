-- CreateTable
CREATE TABLE "Students" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "phone" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "last_login" TIMESTAMP(3),
    "profile_picture" TEXT,
    "chat_moderator" BOOLEAN NOT NULL DEFAULT false,
    "forgot_password_code" TEXT NOT NULL,
    "account_type" INTEGER NOT NULL DEFAULT 1,
    "affiliate_access" INTEGER NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Students_pkey" PRIMARY KEY ("id")
);
