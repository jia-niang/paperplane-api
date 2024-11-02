/*
  Warnings:

  - You are about to drop the column `companyId` on the `OffworkViewRecord` table. All the data in the column will be lost.
  - You are about to drop the column `workplaceId` on the `OffworkViewRecord` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "OffworkViewRecord" DROP CONSTRAINT "OffworkViewRecord_companyId_fkey";

-- DropForeignKey
ALTER TABLE "OffworkViewRecord" DROP CONSTRAINT "OffworkViewRecord_workplaceId_fkey";

-- AlterTable
ALTER TABLE "OffworkViewRecord" DROP COLUMN "companyId",
DROP COLUMN "workplaceId";
