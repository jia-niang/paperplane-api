/*
  Warnings:

  - Added the required column `companyId` to the `OffworkViewRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dailyCompanyRecordId` to the `OffworkViewRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dailyWorkplaceRecordId` to the `OffworkViewRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workdayRecordId` to the `OffworkViewRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workplaceId` to the `OffworkViewRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OffworkViewRecord" ADD COLUMN     "companyId" TEXT NOT NULL,
ADD COLUMN     "dailyCompanyRecordId" TEXT NOT NULL,
ADD COLUMN     "dailyWorkplaceRecordId" TEXT NOT NULL,
ADD COLUMN     "workdayRecordId" TEXT NOT NULL,
ADD COLUMN     "workplaceId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "OffworkViewRecord" ADD CONSTRAINT "OffworkViewRecord_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OffworkViewRecord" ADD CONSTRAINT "OffworkViewRecord_workplaceId_fkey" FOREIGN KEY ("workplaceId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OffworkViewRecord" ADD CONSTRAINT "OffworkViewRecord_workdayRecordId_fkey" FOREIGN KEY ("workdayRecordId") REFERENCES "WorkdayRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OffworkViewRecord" ADD CONSTRAINT "OffworkViewRecord_dailyCompanyRecordId_fkey" FOREIGN KEY ("dailyCompanyRecordId") REFERENCES "DailyCompanyRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OffworkViewRecord" ADD CONSTRAINT "OffworkViewRecord_dailyWorkplaceRecordId_fkey" FOREIGN KEY ("dailyWorkplaceRecordId") REFERENCES "DailyCityRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
