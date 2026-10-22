type Bucket = { count: number; resetAt: number }

export interface RateLimitStorage {
  get(key: string): Promise<Bucket | null>
  upsert(key: string, bucket: Bucket): Promise<{ count: number }>
  increment(key: string): Promise<{ count: number }>
}

export function createRateLimiter(storage: RateLimitStorage) {
  return async function rateLimit(
    key: string,
    limit: number,
    windowMs: number,
  ): Promise<boolean> {
    const now = Date.now()

    try {
      const existing = await storage.get(key)

      if (!existing || existing.resetAt <= now) {
        await storage.upsert(key, { count: 1, resetAt: now + windowMs })
        return true
      }

      const { count } = await storage.increment(key)
      return count <= limit
    } catch {
      // If the storage is unreachable, fail open rather than blocking all users.
      return true
    }
  }
}
