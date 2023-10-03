-- CreateTable
CREATE TABLE "Modules" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "zoom_link" TEXT,
    "external_link" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Modules_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Modules" ADD CONSTRAINT "Modules_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
