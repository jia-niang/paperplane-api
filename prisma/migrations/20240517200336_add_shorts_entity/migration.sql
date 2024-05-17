-- CreateEnum
CREATE TYPE "ShortsType" AS ENUM ('SYSTEM', 'BLOG', 'OFFWORK', 'USER');

-- CreateTable
CREATE TABLE "Shorts" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "expiredAt" TIMESTAMP(3) NOT NULL,
    "type" "ShortsType",
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Shorts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Shorts" ADD CONSTRAINT "Shorts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
