-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "offworkTime" TEXT;

-- CreateTable
CREATE TABLE "DailyOffworkNoticeRecord" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT,
    "dailyCompanyRecordId" TEXT NOT NULL,
    "dailyWorkplaceRecordId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "DailyOffworkNoticeRecord_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DailyOffworkNoticeRecord" ADD CONSTRAINT "DailyOffworkNoticeRecord_dailyCompanyRecordId_fkey" FOREIGN KEY ("dailyCompanyRecordId") REFERENCES "DailyCompanyRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyOffworkNoticeRecord" ADD CONSTRAINT "DailyOffworkNoticeRecord_dailyWorkplaceRecordId_fkey" FOREIGN KEY ("dailyWorkplaceRecordId") REFERENCES "DailyCityRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
