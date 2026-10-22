import { db } from '@/lib/db'
import { createRateLimiter } from '@/lib/rate-limit'

const dbStorage = {
  async get(key: string) {
    const row = await db.rateLimit.findUnique({ where: { key } })
    if (!row) return null
    return { count: row.count, resetAt: row.resetAt.getTime() }
  },

  async upsert(
    key: string,
    bucket: { count: number; resetAt: number },
  ): Promise<{ count: number }> {
    await db.rateLimit.upsert({
      where: { key },
      update: { count: bucket.count, resetAt: new Date(bucket.resetAt) },
      create: {
        key,
        count: bucket.count,
        resetAt: new Date(bucket.resetAt),
      },
    })
    return { count: bucket.count }
  },

  async increment(key: string): Promise<{ count: number }> {
    const updated = await db.rateLimit.update({
      where: { key },
      data: { count: { increment: 1 } },
    })
    return { count: updated.count }
  },
}

export const rateLimit = createRateLimiter(dbStorage)
