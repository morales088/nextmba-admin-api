-- CreateTable
CREATE TABLE "Speakers" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "position" TEXT,
    "company" TEXT,
    "description" TEXT,
    "profile" TEXT,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Speakers_pkey" PRIMARY KEY ("id")
);
