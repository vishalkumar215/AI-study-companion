import { db } from '@/lib/db'
import { getEmbedding, isAiConfigured } from '@/lib/ai'
import { ftsQuery, rankBySimilarity } from '@/lib/retrieval'

export { chunkText, cosineSimilarity } from '@/lib/text'
export { ftsQuery, rankBySimilarity } from '@/lib/retrieval'

export async function searchChunks(
  documentId: string,
  query: string,
  k = 5,
): Promise<Array<{ content: string; score: number }>> {
  const queryEmbedding = isAiConfigured() ? await getEmbedding(query) : []

  // 1) Keyword pre-filter via the FTS5 index to cut the candidate set
  //    from O(n) to a small list, then re-rank those by vector similarity.
  const match = ftsQuery(query)
  let candidates: Array<{ id: string; content: string; embedding: string }> = []

  if (match) {
    try {
      const rows = (await db.$queryRawUnsafe(
        `SELECT c.id, c.content, c.embedding
         FROM "ChunkFTS" f
         JOIN "Chunk" c ON c.rowid = f.rowid
         WHERE "ChunkFTS" MATCH ? AND c."documentId" = ?
         ORDER BY rank
         LIMIT 50`,
        match,
        documentId,
      )) as Array<{ id: string; content: string; embedding: string }>
      candidates = rows
    } catch {
      candidates = []
    }
  }

  // 2) If keyword search found nothing, fall back to scanning the whole
  //    document (bounded by the 500-chunk upload limit).
  if (candidates.length === 0) {
    const chunks = await db.chunk.findMany({
      where: { documentId },
      select: { id: true, content: true, embedding: true },
    })
    candidates = chunks
  }

  return rankBySimilarity(queryEmbedding, candidates, k, query).map(
    ({ content, score }) => ({ content, score }),
  )
}

type GlobalResult = { content: string; score: number; documentId: string; documentTitle: string }

export async function searchAllChunks(
  userId: string,
  query: string,
  k = 8,
): Promise<GlobalResult[]> {
  const queryEmbedding = isAiConfigured() ? await getEmbedding(query) : []

  const match = ftsQuery(query)
  let candidates: Array<{
    id: string
    content: string
    embedding: string
    documentId: string
    documentTitle: string
  }> = []

  if (match) {
    try {
      const rows = (await db.$queryRawUnsafe(
        `SELECT c.id, c.content, c.embedding, c."documentId", d.title AS "documentTitle"
         FROM "ChunkFTS" f
         JOIN "Chunk" c ON c.rowid = f.rowid
         JOIN "Document" d ON d.id = c."documentId"
         WHERE "ChunkFTS" MATCH ? AND d."userId" = ? AND d.status = 'PROCESSED'
         ORDER BY rank
         LIMIT 100`,
        match,
        userId,
      )) as Array<{
        id: string
        content: string
        embedding: string
        documentId: string
        documentTitle: string
      }>
      candidates = rows
    } catch {
      candidates = []
    }
  }

  if (candidates.length === 0) {
    const rows = await db.chunk.findMany({
      where: { document: { userId, status: 'PROCESSED' } },
      select: {
        id: true,
        content: true,
        embedding: true,
        documentId: true,
        document: { select: { title: true } },
      },
      take: 200,
    })
    candidates = rows.map((r) => ({
      id: r.id,
      content: r.content,
      embedding: r.embedding,
      documentId: r.documentId,
      documentTitle: r.document.title,
    }))
  }

  return rankBySimilarity(queryEmbedding, candidates, k, query).map((ranked) => {
    const candidate = candidates.find((c) => c.id === ranked.id)
    return {
      content: ranked.content,
      score: ranked.score,
      documentId: candidate?.documentId ?? '',
      documentTitle: candidate?.documentTitle ?? '',
    }
  })
}
