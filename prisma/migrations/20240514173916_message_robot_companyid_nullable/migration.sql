-- DropForeignKey
ALTER TABLE "MessageRobot" DROP CONSTRAINT "MessageRobot_companyId_fkey";

-- AlterTable
ALTER TABLE "MessageRobot" ALTER COLUMN "companyId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "MessageRobot" ADD CONSTRAINT "MessageRobot_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
