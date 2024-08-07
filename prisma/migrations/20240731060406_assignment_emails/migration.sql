-- CreateTable
CREATE TABLE "Assignment_emails" (
    "id" SERIAL NOT NULL,
    "module_id" INTEGER NOT NULL,
    "name" TEXT,
    "emails" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Assignment_emails_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Assignment_emails" ADD CONSTRAINT "Assignment_emails_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "Modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
