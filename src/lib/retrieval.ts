import { cosineSimilarity, lexicalScore } from './text.ts'

/** Build a safe FTS5 MATCH query from a user string (quoted terms). */
export function ftsQuery(query: string): string | null {
  const terms = query
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 3)

  if (terms.length === 0) return null
  return terms.map((t) => `"${t}"`).join(' AND ')
}

function parseEmbedding(raw: string): number[] {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (Array.isArray(parsed)) return parsed as number[]
  } catch {
    // fall through
  }
  return []
}

/**
 * Re-rank candidate chunks by cosine similarity against a query embedding.
 * When no embedding is available (local demo mode), fall back to lexical
 * overlap so document search still works without a Gemini API key.
 */
export function rankBySimilarity(
  queryEmbedding: number[],
  candidates: Array<{ id: string; content: string; embedding: string }>,
  k: number,
  query?: string,
): Array<{ id: string; content: string; score: number }> {
  const useLexical = queryEmbedding.length === 0 && Boolean(query)

  return candidates
    .map((c) => ({
      id: c.id,
      content: c.content,
      score: useLexical
        ? lexicalScore(query ?? '', c.content)
        : cosineSimilarity(queryEmbedding, parseEmbedding(c.embedding)),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
}
