export function chunkText(
  text: string,
  chunkWords = 800,
  overlapWords = 100,
): string[] {
  if (!text || chunkWords <= 0) return []

  const words = text.replace(/\s+/g, ' ').trim().split(' ')
  const chunks: string[] = []
  const step = Math.max(1, chunkWords - overlapWords)
  let i = 0

  while (i < words.length) {
    chunks.push(words.slice(i, i + chunkWords).join(' '))
    i += step
  }

  return chunks.filter((c) => c.trim().length > 0)
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0

  const dot = a.reduce((sum, value, i) => sum + value * b[i], 0)
  const normA = Math.sqrt(a.reduce((sum, value) => sum + value * value, 0))
  const normB = Math.sqrt(b.reduce((sum, value) => sum + value * value, 0))
  return normA && normB ? dot / (normA * normB) : 0
}

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'also', 'am',
  'an', 'and', 'any', 'are', 'aren', 'as', 'at', 'be', 'because', 'been',
  'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'could',
  'did', 'do', 'does', 'doing', 'don', 'down', 'during', 'each', 'few', 'for',
  'from', 'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here',
  'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into',
  'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself',
  'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
  'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should',
  'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them',
  'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through',
  'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what',
  'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'will', 'with',
  'would', 'you', 'your', 'yours', 'yourself', 'yourselves',
])

export function tokenize(text: string): string[] {
  return text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []
}

export function keywords(text: string): string[] {
  return tokenize(text).filter(
    (token) => token.length >= 3 && !STOP_WORDS.has(token),
  )
}

/** Simple lexical overlap score in [0, 1], used as a retrieval fallback. */
export function lexicalScore(query: string, content: string): number {
  const queryTerms = new Set(keywords(query))
  const contentTerms = new Set(keywords(content))
  if (queryTerms.size === 0 || contentTerms.size === 0) return 0

  let overlap = 0
  for (const term of queryTerms) {
    if (contentTerms.has(term)) overlap += 1
    else if (term.length > 4) {
      for (const candidate of contentTerms) {
        if (
          candidate.length > 4 &&
          (candidate.startsWith(term.slice(0, 5)) ||
            term.startsWith(candidate.slice(0, 5)))
        ) {
          overlap += 0.5
          break
        }
      }
    }
  }

  return overlap / Math.sqrt(queryTerms.size * contentTerms.size)
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Turn a sentence into a fill-in-the-blank card using its longest key term. */
export function makeCloze(
  sentence: string,
): { question: string; answer: string } | null {
  const terms = keywords(sentence)
    .filter((term) => term.length >= 5)
    .sort((a, b) => b.length - a.length)

  for (const term of terms) {
    const match = sentence.match(
      new RegExp(`\\b${escapeRegExp(term)}(?:s|es|ed|ing)?\\b`, 'i'),
    )
    if (match) {
      return {
        question: sentence.replace(match[0], '_____'),
        answer: match[0],
      }
    }
  }

  return null
}

/** Split prose into readable sentences, with fallbacks for lists/headings. */
export function splitSentences(text: string): string[] {
  const rawLines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  const bodyLines = rawLines
    .filter((line) => !/^#{1,6}\s+\S/.test(line))
    .map((line) => line.replace(/^[-*+]\s+/, '').trim())
    .filter(Boolean)

  const lines = (bodyLines.length > 0 ? bodyLines : rawLines).map((line) =>
    line.replace(/^#{1,6}\s+/, ''),
  )

  const normalized = lines.join(' ').replace(/\s+/g, ' ').trim()
  if (!normalized) return []

  const sentences = normalized
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 25)

  if (sentences.length >= 3) return sentences
  if (lines.length >= 3) return lines

  const words = normalized.split(/\s+/)
  const fallback: string[] = []
  for (let i = 0; i < words.length; i += 40) {
    const piece = words.slice(i, i + 50).join(' ')
    if (piece.length > 20) fallback.push(piece)
  }
  return fallback
}
