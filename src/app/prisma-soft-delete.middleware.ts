import { createSoftDeleteMiddleware } from 'prisma-soft-delete-middleware'

export const prismaSoftDeleteMiddleware = createSoftDeleteMiddleware({
  models: {},
  defaultConfig: {
    field: 'deletedAt',
    createValue: deleted => (deleted ? new Date() : null),
  },
})
