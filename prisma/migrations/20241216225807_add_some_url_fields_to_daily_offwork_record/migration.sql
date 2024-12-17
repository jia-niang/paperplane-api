/*
  Warnings:

  - Added the required column `trafficImageUrl` to the `OffworkViewRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `viewUrl` to the `OffworkViewRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OffworkViewRecord" ADD COLUMN     "trafficImageUrl" TEXT NOT NULL,
ADD COLUMN     "viewUrl" TEXT NOT NULL;
