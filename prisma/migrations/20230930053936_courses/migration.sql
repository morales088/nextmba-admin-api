-- CreateTable
CREATE TABLE "Courses" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "cover_photo" TEXT,
    "course_link" TEXT,
    "price" DECIMAL(9,2) NOT NULL,
    "telegram_link" TEXT,
    "paid" INTEGER NOT NULL DEFAULT 1,
    "is_displayed" INTEGER NOT NULL DEFAULT 1,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Courses_pkey" PRIMARY KEY ("id")
);
