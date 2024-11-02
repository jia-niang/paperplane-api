/*
  Warnings:

  - You are about to drop the `DailyOffworkNoticeRecord` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DailyOffworkNoticeRecord" DROP CONSTRAINT "DailyOffworkNoticeRecord_dailyCompanyRecordId_fkey";

-- DropForeignKey
ALTER TABLE "DailyOffworkNoticeRecord" DROP CONSTRAINT "DailyOffworkNoticeRecord_dailyWorkplaceRecordId_fkey";

-- DropTable
DROP TABLE "DailyOffworkNoticeRecord";
