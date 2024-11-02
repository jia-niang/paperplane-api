-- CreateTable
CREATE TABLE "OffworkViewRecord" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "workplaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "OffworkViewRecord_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OffworkViewRecord" ADD CONSTRAINT "OffworkViewRecord_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OffworkViewRecord" ADD CONSTRAINT "OffworkViewRecord_workplaceId_fkey" FOREIGN KEY ("workplaceId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
