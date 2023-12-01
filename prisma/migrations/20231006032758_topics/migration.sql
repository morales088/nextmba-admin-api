-- CreateTable
CREATE TABLE "Topics" (
    "id" SERIAL NOT NULL,
    "module_id" INTEGER NOT NULL,
    "speaker_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "cover_photo" TEXT,
    "type" INTEGER NOT NULL DEFAULT 1,
    "position" INTEGER NOT NULL DEFAULT 1,
    "publish" INTEGER NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Topics_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Topics" ADD CONSTRAINT "Topics_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "Modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topics" ADD CONSTRAINT "Topics_speaker_id_fkey" FOREIGN KEY ("speaker_id") REFERENCES "Speakers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
