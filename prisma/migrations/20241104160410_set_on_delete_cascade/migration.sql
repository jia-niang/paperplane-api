-- DropForeignKey
ALTER TABLE "City" DROP CONSTRAINT "City_companyId_fkey";

-- DropForeignKey
ALTER TABLE "OffworkNoticeMailSubscription" DROP CONSTRAINT "OffworkNoticeMailSubscription_offworkNoticeSettingId_fkey";

-- DropForeignKey
ALTER TABLE "OffworkNoticeSetting" DROP CONSTRAINT "OffworkNoticeSetting_cityId_fkey";

-- DropForeignKey
ALTER TABLE "OffworkNoticeSetting" DROP CONSTRAINT "OffworkNoticeSetting_companyId_fkey";

-- DropForeignKey
ALTER TABLE "OffworkNoticeSetting" DROP CONSTRAINT "OffworkNoticeSetting_messageRobotId_fkey";

-- DropForeignKey
ALTER TABLE "OffworkViewRecord" DROP CONSTRAINT "OffworkViewRecord_companyId_fkey";

-- DropForeignKey
ALTER TABLE "OffworkViewRecord" DROP CONSTRAINT "OffworkViewRecord_dailyCompanyRecordId_fkey";

-- DropForeignKey
ALTER TABLE "OffworkViewRecord" DROP CONSTRAINT "OffworkViewRecord_dailyWorkplaceRecordId_fkey";

-- DropForeignKey
ALTER TABLE "OffworkViewRecord" DROP CONSTRAINT "OffworkViewRecord_workdayRecordId_fkey";

-- DropForeignKey
ALTER TABLE "OffworkViewRecord" DROP CONSTRAINT "OffworkViewRecord_workplaceId_fkey";

-- AlterTable
ALTER TABLE "OffworkViewRecord" ALTER COLUMN "companyId" DROP NOT NULL,
ALTER COLUMN "dailyCompanyRecordId" DROP NOT NULL,
ALTER COLUMN "dailyWorkplaceRecordId" DROP NOT NULL,
ALTER COLUMN "workdayRecordId" DROP NOT NULL,
ALTER COLUMN "workplaceId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OffworkViewRecord" ADD CONSTRAINT "OffworkViewRecord_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OffworkViewRecord" ADD CONSTRAINT "OffworkViewRecord_workplaceId_fkey" FOREIGN KEY ("workplaceId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OffworkViewRecord" ADD CONSTRAINT "OffworkViewRecord_workdayRecordId_fkey" FOREIGN KEY ("workdayRecordId") REFERENCES "WorkdayRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OffworkViewRecord" ADD CONSTRAINT "OffworkViewRecord_dailyCompanyRecordId_fkey" FOREIGN KEY ("dailyCompanyRecordId") REFERENCES "DailyCompanyRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OffworkViewRecord" ADD CONSTRAINT "OffworkViewRecord_dailyWorkplaceRecordId_fkey" FOREIGN KEY ("dailyWorkplaceRecordId") REFERENCES "DailyCityRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OffworkNoticeSetting" ADD CONSTRAINT "OffworkNoticeSetting_messageRobotId_fkey" FOREIGN KEY ("messageRobotId") REFERENCES "MessageRobot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OffworkNoticeSetting" ADD CONSTRAINT "OffworkNoticeSetting_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OffworkNoticeSetting" ADD CONSTRAINT "OffworkNoticeSetting_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OffworkNoticeMailSubscription" ADD CONSTRAINT "OffworkNoticeMailSubscription_offworkNoticeSettingId_fkey" FOREIGN KEY ("offworkNoticeSettingId") REFERENCES "OffworkNoticeSetting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
