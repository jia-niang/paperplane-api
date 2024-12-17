-- AlterTable
ALTER TABLE "OffworkViewRecord" ADD COLUMN     "shortUrl" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "trafficImageUrl" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "viewUrl" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "imageUrl" SET DEFAULT '';
