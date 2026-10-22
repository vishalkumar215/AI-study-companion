import { createUIMessageStream, createUIMessageStreamResponse } from 'ai'

import {
  keywords,
  lexicalScore,
  makeCloze,
  splitSentences,
  tokenize,
} from './text.ts'

export type LocalTopic = { title: string; summary: string }
export type LocalCard = { question: string; answer: string }
export type LocalQuizQuestion = {
  question: string
  options: string[]
  answerIndex: number
}
export type LocalQuiz = { title: string; questions: LocalQuizQuestion[] }

const EMBEDDING_DIMENSIONS = 96

const GENERIC_OPTIONS = [
  'None of the above',
  'This is not covered by the document',
  'An unrelated idea from another subject',
  'The opposite of what the document states',
  'A detail that does not appear in the text',
]

/** Deterministic hashed bag-of-words embedding used when no API key is set. */
export function localEmbedding(text: string): number[] {
  const vector = new Array<number>(EMBEDDING_DIMENSIONS).fill(0)

  for (const token of tokenize(text)) {
    let hash = 2166136261
    for (let i = 0; i < token.length; i += 1) {
      hash ^= token.charCodeAt(i)
      hash = Math.imul(hash, 16777619)
    }

    const index = Math.abs(hash) % EMBEDDING_DIMENSIONS
    const sign = (hash & 1) === 0 ? 1 : -1
    const weight = token.length >= 7 ? 1.4 : token.length >= 4 ? 1 : 0.6
    vector[index] += sign * weight
  }

  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0))
  return norm === 0 ? vector : vector.map((value) => value / norm)
}

/** Stream a plain-text answer through the AI SDK UI message protocol. */
export function createLocalChatResponse(text: string): Response {
  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      writer.write({ type: 'text-start', id })

      const chunks = text.match(/[\s\S]{1,80}/g) ?? [text]
      for (const delta of chunks) {
        writer.write({ type: 'text-delta', id, delta })
      }

      writer.write({ type: 'text-end', id })
    },
  })

  return createUIMessageStreamResponse({ stream })
}

export function localStudyAnswer(
  question: string,
  contexts: { title?: string; content: string }[],
): string {
  const candidates: { text: string; score: number; title?: string }[] = []

  for (const context of contexts) {
    for (const sentence of splitSentences(context.content)) {
      const score = lexicalScore(question, sentence)
      if (score > 0) {
        candidates.push({ text: sentence, score, title: context.title })
      }
    }
  }

  candidates.sort((a, b) => b.score - a.score)
  const unique: typeof candidates = []
  for (const candidate of candidates) {
    if (unique.some((item) => item.text === candidate.text)) continue
    unique.push(candidate)
    if (unique.length === 5) break
  }

  if (unique.length === 0) {
    const fallback = contexts
      .flatMap((context) => splitSentences(context.content).slice(0, 1))
      .slice(0, 2)
      .join(' ')
    return [
      'I could not find a direct match for that question in this document.',
      fallback ? `The document discusses: ${truncate(fallback, 400)}` : '',
    ]
      .filter(Boolean)
      .join(' ')
  }

  const evidence = unique
    .slice(0, 4)
    .map(
      (item, index) =>
        `[${index + 1}] ${truncate(item.text, 400)}${item.title ? ` (${item.title})` : ''}`,
    )

  return `Based on this document:\n\n${evidence.join('\n\n')}\n\nIn short, ${truncate(unique[0].text, 400)}`
}

export function localGlobalAnswer(
  question: string,
  contexts: { documentTitle?: string; title?: string; content: string }[],
): string {
  const candidates: { text: string; score: number; source: string }[] = []

  for (const context of contexts) {
    const source = context.documentTitle ?? context.title ?? 'Your documents'
    for (const sentence of splitSentences(context.content)) {
      const score = lexicalScore(question, sentence)
      if (score > 0) {
        candidates.push({ text: sentence, score, source })
      }
    }
  }

  candidates.sort((a, b) => b.score - a.score)
  const unique: typeof candidates = []
  for (const candidate of candidates) {
    if (unique.some((item) => item.text === candidate.text)) continue
    unique.push(candidate)
    if (unique.length === 4) break
  }

  if (unique.length === 0) {
    return 'I could not find an answer to that question in your processed documents. Try uploading more material or rephrasing the question.'
  }

  const evidence = unique.map(
    (item, index) =>
      `[${index + 1}] ${truncate(item.text, 350)} — ${item.source}`,
  )

  return `Here is what your documents say:\n\n${evidence.join('\n\n')}\n\nShort answer: ${truncate(unique[0].text, 350)}`
}

export function localResearchAnswer(): string {
  return 'No web search is configured in this local demo. I can still answer from your own documents in Study chat. Add a Google Gemini API key to enable full research answers.'
}

export function localAnalyzeDocument(
  title: string,
  content: string,
): { topics: LocalTopic[] } {
  const headings = extractHeadings(content)
  const sentences = splitSentences(content)
  const source = sentences.length > 0 ? sentences : [truncate(content, 400) || title]
  const topics: LocalTopic[] = []

  if (headings.length >= 3) {
    for (const heading of headings.slice(0, 8)) {
      const summary =
        [...source].sort(
          (a, b) => lexicalScore(heading, b) - lexicalScore(heading, a),
        )[0] ?? heading
      topics.push({ title: cleanTitle(heading), summary })
    }
  }

  const target = Math.max(4, Math.min(8, Math.round(source.length / 3) || 4))
  let index = 0
  while (topics.length < target && index < source.length * 2) {
    const sentence = source[index % source.length]
    index += 1
    if (!sentence) break

    let topicTitle = titleFrom(sentence)
    if (topics.some((topic) => topic.title === topicTitle)) {
      topicTitle = `${topicTitle} (${topics.length + 1})`
    }
    topics.push({ title: topicTitle, summary: sentence })
  }

  const unique = dedupeTopics(topics)
  while (unique.length < 3) {
    const summary = source[unique.length % source.length] ?? title
    unique.push({ title: `Study focus ${unique.length + 1}`, summary })
  }

  return { topics: unique.slice(0, 8) }
}

export function localGenerateFlashcards(
  title: string,
  content: string,
  count?: number,
): { cards: LocalCard[] } {
  const { topics } = localAnalyzeDocument(title, content)
  const sentences = splitSentences(content)
  const source = sentences.length > 0 ? sentences : topics.map((topic) => topic.summary)
  const target = Math.min(30, Math.max(1, count ?? Math.min(18, topics.length * 3)))
  const cards: LocalCard[] = []
  const seen = new Set<string>()

  const add = (question: string, answer: string) => {
    if (cards.length >= target) return
    const key = question.toLowerCase()
    if (seen.has(key) || !answer.trim()) return
    seen.add(key)
    cards.push({ question: truncate(question, 300), answer: truncate(answer, 500) })
  }

  for (const topic of topics) {
    const cloze = makeCloze(topic.summary)
    if (cloze) add(cloze.question, cloze.answer)
    add(`What is the key idea of "${topic.title}"?`, topic.summary)
  }

  for (const sentence of source) {
    if (cards.length >= target) break
    const cloze = makeCloze(sentence)
    if (cloze) add(cloze.question, cloze.answer)
  }

  const templates: ((topic: LocalTopic) => LocalCard)[] = [
    (topic) => ({
      question: `Summarize ${topic.title}.`,
      answer: topic.summary,
    }),
    (topic) => ({
      question: `Why does "${topic.title}" matter?`,
      answer: topic.summary,
    }),
    (topic) => ({
      question: `What facts should you remember about "${topic.title}"?`,
      answer: topic.summary,
    }),
    (topic) => ({
      question: `How would you explain "${topic.title}" in your own words?`,
      answer: topic.summary,
    }),
    (topic) => ({
      question: `List the main points of "${topic.title}".`,
      answer: topic.summary,
    }),
    (topic) => ({
      question: `What is a likely exam focus for "${topic.title}"?`,
      answer: topic.summary,
    }),
    (topic) => ({
      question: `What detail supports "${topic.title}"?`,
      answer: topic.summary,
    }),
    (topic) => ({
      question: `Which term is most closely associated with "${topic.title}"?`,
      answer: keywords(topic.summary).slice(0, 5).join(', ') || topic.summary,
    }),
  ]

  let round = 0
  while (cards.length < target && round < templates.length) {
    for (const topic of topics) {
      if (cards.length >= target) break
      const card = templates[round](topic)
      add(card.question, card.answer)
    }
    round += 1
  }

  return { cards }
}

export function localGenerateQuiz(
  title: string,
  content: string,
  count?: number,
): LocalQuiz {
  const { topics } = localAnalyzeDocument(title, content)
  const sentences = splitSentences(content)
  const allSummaries = topics.map((topic) => topic.summary)
  const allTitles = topics.map((topic) => topic.title)
  const allTerms = uniqueStrings(
    keywords(content).filter((term) => term.length >= 4),
  ).slice(0, 20)
  const target = Math.min(
    40,
    Math.max(5, count ?? Math.min(10, Math.max(5, topics.length * 2))),
  )
  const questions: LocalQuizQuestion[] = []
  const seen = new Set<string>()

  const add = (question: string, correct: string, pool: string[]) => {
    if (questions.length >= target) return
    const key = question.toLowerCase().slice(0, 120)
    if (seen.has(key)) return
    seen.add(key)
    questions.push(buildQuestion(question, correct, pool))
  }

  for (const topic of topics) {
    const otherSummaries = allSummaries.filter(
      (summary) => summary !== topic.summary,
    )
    const otherTitles = allTitles.filter((item) => item !== topic.title)

    add(
      `Which statement best describes "${topic.title}"?`,
      topic.summary,
      [...otherSummaries, ...allSummaries],
    )
    add(
      `According to the document, which of these is true about "${topic.title}"?`,
      topic.summary,
      [...otherSummaries, ...allSummaries],
    )

    const cloze = makeCloze(topic.summary)
    if (cloze) {
      add(`Fill in the blank: ${cloze.question}`, cloze.answer, allTerms)
    }

    add(
      `Which topic does this statement belong to? "${truncate(topic.summary, 180)}"`,
      topic.title,
      otherTitles,
    )
  }

  for (const sentence of sentences) {
    if (questions.length >= target) break
    const cloze = makeCloze(sentence)
    if (cloze) {
      add(`Complete the statement: "${cloze.question}"`, cloze.answer, allTerms)
    }
  }

  let variant = 0
  while (questions.length < Math.min(5, target)) {
    const topic = topics[questions.length % topics.length]
    add(
      `What is the main idea of "${topic.title}"${variant > 0 ? ` (review ${variant})` : ''}?`,
      topic.summary,
      allSummaries.filter((summary) => summary !== topic.summary),
    )
    variant += 1
  }

  return {
    title: `Quiz: ${cleanTitle(title)}`,
    questions: questions.slice(0, target),
  }
}

function buildQuestion(
  question: string,
  correct: string,
  pool: string[],
): LocalQuizQuestion {
  const options = uniqueStrings([
    truncate(correct, 400),
    ...pool.map((option) => truncate(option, 400)),
  ])

  let fallbackIndex = 0
  while (options.length < 4) {
    const candidate = GENERIC_OPTIONS[fallbackIndex % GENERIC_OPTIONS.length]
    fallbackIndex += 1
    if (!options.includes(candidate)) {
      options.push(candidate)
    } else if (fallbackIndex > 40) {
      options.push(`Option ${options.length + 1}`)
    }
  }

  const trimmed = options.slice(0, 4)
  const shuffled = shuffleOptions(trimmed, hashToken(question))

  return {
    question: truncate(question, 500),
    options: shuffled.options,
    answerIndex: shuffled.answerIndex,
  }
}

function shuffleOptions(
  options: string[],
  seed: number,
): { options: string[]; answerIndex: number } {
  const correct = options[0]
  const shuffled = [...options]
  const random = mulberry32(seed)

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return {
    options: shuffled,
    answerIndex: Math.max(0, shuffled.indexOf(correct)),
  }
}

function mulberry32(seed: number): () => number {
  let value = seed >>> 0
  return () => {
    value = (value + 0x6d2b79f5) | 0
    let t = Math.imul(value ^ (value >>> 15), 1 | value)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashToken(value: string): number {
  let hash = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function extractHeadings(content: string): string[] {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^#{1,6}\s+\S/.test(line))
    .map((line) => line.replace(/^#{1,6}\s+/, '').trim())
    .filter((line) => line.length >= 3)
}

function cleanTitle(value: string): string {
  const cleaned = value
    .replace(/^#{1,6}\s+/, '')
    .replace(/^[-*+]\s+/, '')
    .replace(/[.:;!?]+$/, '')
    .replace(/\s+/g, ' ')
    .trim()

  return truncate(cleaned || 'Untitled topic', 90)
}

function titleFrom(sentence: string): string {
  const clause = sentence
    .split(/[:;—–]/)[0]
    .replace(/[.!?].*$/, '')
    .trim()
  const words = clause.split(/\s+/).filter(Boolean)
  const candidate =
    words.length >= 3
      ? words.slice(0, 8).join(' ')
      : keywords(sentence).slice(0, 5).join(' ')

  return cleanTitle(candidate || 'Key idea')
}

function dedupeTopics(topics: LocalTopic[]): LocalTopic[] {
  const seen = new Set<string>()
  const unique: LocalTopic[] = []

  for (const topic of topics) {
    const key = topic.title.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    unique.push({
      title: truncate(topic.title, 90),
      summary: truncate(topic.summary, 500),
    })
  }

  return unique
}

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  for (const value of values) {
    const trimmed = value.trim()
    if (!trimmed) continue
    const key = trimmed.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    result.push(trimmed)
  }

  return result
}

function truncate(value: string, max: number): string {
  const cleaned = value.replace(/\s+/g, ' ').trim()
  if (cleaned.length <= max) return cleaned
  return `${cleaned.slice(0, Math.max(0, max - 3)).trimEnd()}...`
}
