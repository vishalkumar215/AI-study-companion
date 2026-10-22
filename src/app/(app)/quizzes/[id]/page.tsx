import { notFound } from 'next/navigation'
import Link from 'next/link'
import { verifySession } from '@/lib/dal'
import { db } from '@/lib/db'
import { QuizTaker } from './quiz-taker'

export default async function QuizPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await verifySession()

  const quiz = await db.quiz.findFirst({
    where: { id, userId: session.userId },
    include: {
      document: { select: { title: true } },
      questions: { orderBy: { id: 'asc' } },
    },
  })

  if (!quiz) notFound()

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/quizzes"
          className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
        >
          ← All quizzes
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">{quiz.title}</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {quiz.questions.length} questions · from{' '}
          {quiz.document?.title ?? 'document'}
        </p>
      </div>

      <QuizTaker
        quizId={quiz.id}
        questions={quiz.questions.map((q) => ({
          id: q.id,
          question: q.question,
          options: JSON.parse(q.options) as string[],
          answerIndex: q.answerIndex,
          userAnswerIndex: q.userAnswerIndex,
        }))}
      />
    </div>
  )
}
