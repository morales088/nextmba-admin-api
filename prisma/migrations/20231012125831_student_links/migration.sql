-- CreateTable
CREATE TABLE "Student_links" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "link" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Student_links_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Student_links" ADD CONSTRAINT "Student_links_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
