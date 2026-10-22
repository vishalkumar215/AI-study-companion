'use server'

import { z } from 'zod'
import { generateObject } from 'ai'
import { revalidatePath } from 'next/cache'
import { verifySession } from '@/lib/dal'
import { db } from '@/lib/db'
import { chatModel, isAiConfigured } from '@/lib/ai'
import { localGenerateQuiz } from '@/lib/local-ai'
import { analyzeDocument } from '@/lib/analyze'

const QuizSchema = z.object({
  title: z.string(),
  questions: z
    .array(
      z.object({
        question: z.string(),
        options: z.array(z.string()).length(4),
        answerIndex: z.number().int().min(0).max(3),
      }),
    )
    .min(5)
    .max(40),
})

export type QuizActionState = { error?: string } | undefined

export async function generateQuiz(
  state: QuizActionState,
  formData: FormData,
): Promise<QuizActionState> {
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

    const targetCount = Math.min(40, Math.max(12, topics.length * 4))

    let object: {
      title: string
      questions: Array<{
        question: string
        options: string[]
        answerIndex: number
      }>
    }

    if (isAiConfigured()) {
      const generated = await generateObject({
        model: chatModel,
        schema: QuizSchema,
        system:
          'You are an expert study assistant. Create a multiple choice quiz covering ALL of the analyzed topics of the document. Each question must have exactly 4 options with exactly one correct answer. Distribute the questions so that every topic is covered.',
        prompt: `Document title: ${document.title}\n\nKey topics extracted from the document (there are ${topics.length}):\n${topicText}\n\nCreate exactly ${targetCount} questions so the whole document summary is covered.`,
      })
      object = generated.object
    } else {
      object = localGenerateQuiz(document.title, content, targetCount)
    }

    const quiz = await db.quiz.create({
      data: {
        userId: session.userId,
        documentId,
        title: object.title,
      },
    })

    await db.quizQuestion.createMany({
      data: object.questions.map((q) => ({
        quizId: quiz.id,
        question: q.question,
        options: JSON.stringify(q.options),
        answerIndex: q.answerIndex,
      })),
    })
  } catch (error) {
    console.error(error)
    return {
      error:
        'Could not generate the quiz. Check your AI API key, then try again.',
    }
  }

  revalidatePath('/quizzes')
}

export async function submitQuiz(
  quizId: string,
  answers: Record<string, number>,
) {
  const session = await verifySession()

  const quiz = await db.quiz.findFirst({
    where: { id: quizId, userId: session.userId },
    include: { questions: true },
  })
  if (!quiz) return null

  let score = 0

  await db.$transaction(
    quiz.questions.map((q) => {
      const selected = answers[q.id]
      if (selected === q.answerIndex) score += 1
      return db.quizQuestion.update({
        where: { id: q.id },
        data: { userAnswerIndex: selected ?? null },
      })
    }),
  )

  revalidatePath(`/quizzes/${quizId}`)

  return {
    total: quiz.questions.length,
    correct: score,
    percentage: Math.round((score / quiz.questions.length) * 100),
  }
}
