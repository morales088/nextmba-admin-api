-- CreateTable
CREATE TABLE "Subscriber_groups" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "group_name" TEXT,
    "group_id" INTEGER NOT NULL,
    "start_date_field" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Subscriber_groups_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Subscriber_groups" ADD CONSTRAINT "Subscriber_groups_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
