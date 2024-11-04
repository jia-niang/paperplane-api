import { createSoftDeleteMiddleware } from 'prisma-soft-delete-middleware'

export const prismaSoftDeleteMiddleware = createSoftDeleteMiddleware({
  models: {
    User: true,
    Company: true,
    Workplace: true,
    MessageRobot: true,

    WorkdayRecord: true,
    DailyCompanyRecord: true,
    DailyWorkplaceRecord: true,
    OffworkViewRecord: true,
    OffworkNoticeSetting: true,
    OffworkNoticeMailSubscription: true,

    GitProject: true,
    GitRepo: true,
    GitStaff: true,
    GitCommit: true,
    GitReport: true,

    Shorts: true,
  },
  defaultConfig: {
    field: 'deletedAt',
    createValue: deleted => (deleted ? new Date() : null),
  },
})
