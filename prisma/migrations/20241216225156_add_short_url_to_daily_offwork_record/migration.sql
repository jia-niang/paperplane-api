/*
  Warnings:

  - Added the required column `shortUrl` to the `OffworkViewRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OffworkViewRecord" ADD COLUMN     "shortUrl" TEXT NOT NULL;
