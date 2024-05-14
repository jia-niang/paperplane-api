-- AlterTable
ALTER TABLE "MessageRobot" ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "MessageRobot" ADD CONSTRAINT "MessageRobot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
