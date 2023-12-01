-- CreateTable
CREATE TABLE "Medias" (
    "id" SERIAL NOT NULL,
    "module_id" INTEGER NOT NULL,
    "topic_id" INTEGER NOT NULL,
    "language_code" VARCHAR(255) NOT NULL,
    "media_type" INTEGER NOT NULL DEFAULT 1,
    "source" INTEGER NOT NULL DEFAULT 1,
    "source_code" VARCHAR(255) NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Medias_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Medias" ADD CONSTRAINT "Medias_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "Modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medias" ADD CONSTRAINT "Medias_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
