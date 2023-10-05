-- CreateTable
CREATE TABLE "Translations" (
    "id" SERIAL NOT NULL,
    "language_code" VARCHAR(255) NOT NULL,
    "module_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Translations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Translations" ADD CONSTRAINT "Translations_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "Modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
