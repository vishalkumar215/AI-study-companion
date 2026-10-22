import { PrismaClient } from '@/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createClient() {
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? 'file:./dev.db',
  })
  return new PrismaClient({ adapter })
}

export const db = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

const FTS_READY = Symbol.for('studymate.fts-ready')

async function ensureFtsInitialized() {
  const global = globalThis as unknown as Record<symbol, boolean>
  if (global[FTS_READY]) return

  // SQLite FTS5 index over chunk content for fast hybrid retrieval.
  // Idempotent at runtime so existing databases upgrade without a migration.
  await db.$executeRawUnsafe(
    `CREATE VIRTUAL TABLE IF NOT EXISTS "ChunkFTS" USING fts5(content)`,
  )
  global[FTS_READY] = true
}

export async function syncChunkFtsInsert(chunkId: string, content: string) {
  await ensureFtsInitialized()
  await db.$executeRawUnsafe(
    `INSERT INTO "ChunkFTS" (rowid, content)
     VALUES ((SELECT rowid FROM "Chunk" WHERE id = ?), ?)`,
    chunkId,
    content,
  )
}

export async function syncChunkFtsDelete(chunkId: string) {
  await ensureFtsInitialized()
  await db.$executeRawUnsafe(
    `DELETE FROM "ChunkFTS" WHERE rowid = (SELECT rowid FROM "Chunk" WHERE id = ?)`,
    chunkId,
  )
}

export async function rebuildChunkFts() {
  await ensureFtsInitialized()
  await db.$executeRawUnsafe(`DELETE FROM "ChunkFTS"`)
  const chunks = await db.chunk.findMany({ select: { id: true, content: true } })
  for (const chunk of chunks) {
    await syncChunkFtsInsert(chunk.id, chunk.content)
  }
}
