/*
  Warnings:

  - The values [BLOG] on the enum `ShortsType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ShortsType_new" AS ENUM ('SYSTEM', 'OFFWORK', 'USER');
ALTER TABLE "Shorts" ALTER COLUMN "type" TYPE "ShortsType_new" USING ("type"::text::"ShortsType_new");
ALTER TYPE "ShortsType" RENAME TO "ShortsType_old";
ALTER TYPE "ShortsType_new" RENAME TO "ShortsType";
DROP TYPE "ShortsType_old";
COMMIT;
