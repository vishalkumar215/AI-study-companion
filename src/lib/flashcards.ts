'use server'

import { z } from 'zod'
import { generateObject } from 'ai'
import { revalidatePath } from 'next/cache'
import { verifySession } from '@/lib/dal'
import { db } from '@/lib/db'
import { chatModel, isAiConfigured } from '@/lib/ai'
import { localGenerateFlashcards } from '@/lib/local-ai'
import { analyzeDocument } from '@/lib/analyze'
import { sm2 } from '@/lib/sm2'

const CardSchema = z.object({
  cards: z
    .array(z.object({ question: z.string(), answer: z.string() }))
    .min(5)
    .max(40),
})

export type FlashcardActionState = { error?: string } | undefined

export async function generateFlashcards(
  state: FlashcardActionState,
  formData: FormData,
): Promise<FlashcardActionState> {
  const session = await verifySession()
  const documentId = String(formData.get('documentId') ?? '')

  const document = await db.document.findFirst({
    where: { id: documentId, userId: session.userId },
  })
  if (!document) return

  const content = document.content.slice(0, 12000)

  try {
    const topics = await analyzeDocument(document.title, content)
    const topicText = topics
      .map((t, i) => `${i + 1}. ${t.title}: ${t.summary}`)
      .join('\n')

    const targetCount = Math.min(40, Math.max(12, topics.length * 3))

    let cards: Array<{ question: string; answer: string }>

    if (isAiConfigured()) {
      const { object } = await generateObject({
        model: chatModel,
        schema: CardSchema,
        system:
          'You are an expert study assistant. Create flashcards covering ALL of the analyzed topics of the document. Questions should test real understanding of the concepts, not trivia. Distribute the cards so that every topic is covered.',
        prompt: `Document title: ${document.title}\n\nKey topics extracted from the document (there are ${topics.length}):\n${topicText}\n\nCreate exactly ${targetCount} flashcards so the whole document summary is covered.`,
      })
      cards = object.cards
    } else {
      cards = localGenerateFlashcards(
        document.title,
        content,
        targetCount,
      ).cards
    }

    await db.flashcard.createMany({
      data: cards.map((c) => ({
        userId: session.userId,
        documentId,
        question: c.question,
        answer: c.answer,
      })),
    })
  } catch (error) {
    console.error(error)
    return {
      error:
        'Could not generate flashcards. Check your AI API key, then try again.',
    }
  }

  revalidatePath('/flashcards')
}

export async function reviewFlashcard(cardId: string, grade: number) {
  const session = await verifySession()

  const card = await db.flashcard.findFirst({
    where: { id: cardId, userId: session.userId },
  })
  if (!card) return

  const next = sm2(card.easeFactor, card.interval, card.repetitions, grade)

  const dueAt = new Date()
  dueAt.setDate(dueAt.getDate() + Math.max(1, next.interval))

  await db.flashcard.update({
    where: { id: cardId },
    data: {
      easeFactor: next.easeFactor,
      interval: next.interval,
      repetitions: next.repetitions,
      dueAt,
      lastReviewedAt: new Date(),
    },
  })

  revalidatePath('/flashcards')
}
