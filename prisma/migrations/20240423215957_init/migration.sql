-- CreateEnum
CREATE TYPE "MessageRobotType" AS ENUM ('DINGTALK', 'WXBIZ', 'FEISHU');

-- CreateEnum
CREATE TYPE "GitCommonStatus" AS ENUM ('INIT', 'READY', 'PENDING', 'ERROR');

-- CreateTable
CREATE TABLE "WorkdayRecord" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "isWorkDay" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "WorkdayRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "stockCode" TEXT,
    "salaryDate" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyCompanyRecord" (
    "id" TEXT NOT NULL,
    "salaryDate" TEXT,
    "restDays" INTEGER,
    "todayStock" DOUBLE PRECISION,
    "yesterdayStock" DOUBLE PRECISION,
    "delta" DOUBLE PRECISION,
    "workdayRecordId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "DailyCompanyRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "weatherCode" TEXT,
    "oilpriceCode" TEXT,
    "mapLatitude" TEXT,
    "mapLongitude" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyCityRecord" (
    "id" TEXT NOT NULL,
    "todayWeather" TEXT,
    "todayTemperature" TEXT,
    "todayWid" TEXT,
    "tomorrowWeather" TEXT,
    "tomorrowTemperature" TEXT,
    "tomorrowWid" TEXT,
    "h92" DOUBLE PRECISION,
    "h95" DOUBLE PRECISION,
    "h98" DOUBLE PRECISION,
    "traffic" TEXT,
    "workdayRecordId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "DailyCityRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageRobot" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "MessageRobotType" NOT NULL,
    "accessToken" TEXT,
    "secret" TEXT,
    "extraAuthentication" JSONB,
    "desc" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "MessageRobot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OffworkNoticeSetting" (
    "id" TEXT NOT NULL,
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "messageRobotId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "OffworkNoticeSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GitProject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weeklyStatus" "GitCommonStatus" NOT NULL DEFAULT 'INIT',
    "publicKey" TEXT,
    "privateKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "GitProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GitRepo" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "status" "GitCommonStatus" NOT NULL DEFAULT 'INIT',
    "lastSync" TIMESTAMP(3),
    "recentBranches" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "gitProjectId" TEXT,

    CONSTRAINT "GitRepo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GitStaff" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "alternativeNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "gitProjectId" TEXT,

    CONSTRAINT "GitStaff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GitCommit" (
    "id" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "dateString" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorEmail" TEXT NOT NULL,
    "refs" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "gitRepoId" TEXT,

    CONSTRAINT "GitCommit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GitReport" (
    "id" TEXT NOT NULL,
    "content" TEXT,
    "gitProjectId" TEXT NOT NULL,
    "gitStaffId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "GitReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GitProject_name_key" ON "GitProject"("name");

-- CreateIndex
CREATE UNIQUE INDEX "GitRepo_name_key" ON "GitRepo"("name");

-- CreateIndex
CREATE UNIQUE INDEX "GitRepo_url_key" ON "GitRepo"("url");

-- CreateIndex
CREATE UNIQUE INDEX "GitStaff_name_key" ON "GitStaff"("name");

-- AddForeignKey
ALTER TABLE "DailyCompanyRecord" ADD CONSTRAINT "DailyCompanyRecord_workdayRecordId_fkey" FOREIGN KEY ("workdayRecordId") REFERENCES "WorkdayRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyCompanyRecord" ADD CONSTRAINT "DailyCompanyRecord_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyCityRecord" ADD CONSTRAINT "DailyCityRecord_workdayRecordId_fkey" FOREIGN KEY ("workdayRecordId") REFERENCES "WorkdayRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyCityRecord" ADD CONSTRAINT "DailyCityRecord_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageRobot" ADD CONSTRAINT "MessageRobot_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OffworkNoticeSetting" ADD CONSTRAINT "OffworkNoticeSetting_messageRobotId_fkey" FOREIGN KEY ("messageRobotId") REFERENCES "MessageRobot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OffworkNoticeSetting" ADD CONSTRAINT "OffworkNoticeSetting_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OffworkNoticeSetting" ADD CONSTRAINT "OffworkNoticeSetting_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GitRepo" ADD CONSTRAINT "GitRepo_gitProjectId_fkey" FOREIGN KEY ("gitProjectId") REFERENCES "GitProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GitStaff" ADD CONSTRAINT "GitStaff_gitProjectId_fkey" FOREIGN KEY ("gitProjectId") REFERENCES "GitProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GitCommit" ADD CONSTRAINT "GitCommit_gitRepoId_fkey" FOREIGN KEY ("gitRepoId") REFERENCES "GitRepo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GitReport" ADD CONSTRAINT "GitReport_gitProjectId_fkey" FOREIGN KEY ("gitProjectId") REFERENCES "GitProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GitReport" ADD CONSTRAINT "GitReport_gitStaffId_fkey" FOREIGN KEY ("gitStaffId") REFERENCES "GitStaff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
