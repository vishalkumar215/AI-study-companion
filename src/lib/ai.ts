import 'server-only'
import { google } from '@ai-sdk/google'
import { embed, embedMany } from 'ai'

import { localEmbedding } from './local-ai.ts'

export const embeddingModel = google.embedding('gemini-embedding-001')
export const chatModel = google.languageModel('gemini-3.5-flash-lite')

export function isAiConfigured(): boolean {
  return Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim())
}

// Grounding with Google Search requires a paid/billed Gemini API plan.
// Set RESEARCH_WEB_SEARCH=true to enable live web search; otherwise the
// research chat answers from the model's own knowledge (free tier safe).
export const researchSearchTool =
  isAiConfigured() && process.env.RESEARCH_WEB_SEARCH === 'true'
    ? google.tools.googleSearch({
        searchTypes: { webSearch: {} },
      })
    : null

export async function getEmbedding(text: string): Promise<number[]> {
  if (!isAiConfigured()) return localEmbedding(text)

  const { embedding } = await embed({
    model: embeddingModel,
    value: text,
  })
  return embedding
}

export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  if (!isAiConfigured()) return texts.map((text) => localEmbedding(text))

  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: texts,
  })
  return embeddings
}
