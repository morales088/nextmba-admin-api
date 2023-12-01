-- CreateTable
CREATE TABLE "Files" (
    "id" SERIAL NOT NULL,
    "topic_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" INTEGER NOT NULL DEFAULT 1,
    "file_link" TEXT,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Files_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Files" ADD CONSTRAINT "Files_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
