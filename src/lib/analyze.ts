import 'server-only'

import { z } from 'zod'
import { generateObject } from 'ai'
import { chatModel, isAiConfigured } from '@/lib/ai'
import { localAnalyzeDocument } from '@/lib/local-ai'

const TopicsSchema = z.object({
  topics: z
    .array(
      z.object({
        title: z.string(),
        summary: z.string(),
      }),
    )
    .min(3)
    .max(8),
})

export type AnalyzedTopic = { title: string; summary: string }

export async function analyzeDocument(
  title: string,
  content: string,
): Promise<AnalyzedTopic[]> {
  if (!isAiConfigured()) {
    return localAnalyzeDocument(title, content).topics
  }

  const { object } = await generateObject({
    model: chatModel,
    schema: TopicsSchema,
    system:
      'You are an expert study assistant. Analyze the document and extract the ' +
      'most important topics a student should know. For each topic, give a short ' +
      'title and a 1-2 sentence summary of the key facts a student must understand.',
    prompt: `Document title: ${title}\n\n${content}`,
  })

  return object.topics
}
