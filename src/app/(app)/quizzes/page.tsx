import Link from 'next/link'
import { verifySession } from '@/lib/dal'
import { db } from '@/lib/db'
import { GenerateQuizForm } from './generate-form'
import { Pagination } from '@/components/pagination'

const PER_PAGE = 5

export default async function QuizzesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const session = await verifySession()
  const { page: pageStr } = await searchParams
  const page = Math.max(1, Number(pageStr) || 1)

  const quizCount = await db.quiz.count({ where: { userId: session.userId } })
  const totalPages = Math.max(1, Math.ceil(quizCount / PER_PAGE))
  const safePage = Math.min(page, totalPages)

  const [quizzes, documents] = await Promise.all([
    db.quiz.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      skip: (safePage - 1) * PER_PAGE,
      take: PER_PAGE,
      include: {
        document: { select: { title: true } },
        questions: {
          select: { userAnswerIndex: true, answerIndex: true },
        },
      },
    }),
    db.document.findMany({
      where: { userId: session.userId, status: 'PROCESSED' },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true },
    }),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Quizzes</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Test yourself with AI-generated multiple choice quizzes.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Generate a quiz</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Pick a document and the AI writes a 5-question quiz from it.
        </p>

        {documents.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            Upload a document first to generate quizzes.
          </p>
        ) : (
          <GenerateQuizForm documents={documents} />
        )}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-white">
          Your quizzes ({quizzes.length})
        </h2>

        {quizzes.length === 0 ? (
          <p className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            No quizzes yet. Generate one above.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {quizzes.map((quiz) => {
              const answered = quiz.questions.filter(
                (q) => q.userAnswerIndex !== null,
              ).length
              const taken = answered === quiz.questions.length && answered > 0

              return (
                <Link
                  key={quiz.id}
                  href={`/quizzes/${quiz.id}`}
                  className="rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-indigo-600 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-zinc-900 dark:text-white">{quiz.title}</p>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        taken
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {taken ? 'Completed' : 'Not taken'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {quiz.questions.length} questions · from{' '}
                    {quiz.document?.title ?? 'document'} ·{' '}
                    {quiz.createdAt.toLocaleDateString()}
                  </p>
                </Link>
              )
            })}
          </div>
        )}
        <Pagination page={safePage} totalPages={totalPages} basePath="/quizzes" />
      </div>
    </div>
  )
}
