-- CreateTable
CREATE TABLE "OffworkNoticeMailSubscription" (
    "id" TEXT NOT NULL,
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "mail" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "offworkNoticeSettingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "OffworkNoticeMailSubscription_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OffworkNoticeMailSubscription" ADD CONSTRAINT "OffworkNoticeMailSubscription_offworkNoticeSettingId_fkey" FOREIGN KEY ("offworkNoticeSettingId") REFERENCES "OffworkNoticeSetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
