import { verifySession } from '@/lib/dal'
import { db } from '@/lib/db'
import { FlashcardReview } from './review'
import { GenerateFlashcardForm } from './generate-form'
import { Pagination } from '@/components/pagination'

const PER_PAGE = 10

export default async function FlashcardsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const session = await verifySession()
  const { page: pageStr } = await searchParams
  const page = Math.max(1, Number(pageStr) || 1)

  const recentCardCount = await db.flashcard.count({
    where: { userId: session.userId },
  })
  const totalPages = Math.max(1, Math.ceil(recentCardCount / PER_PAGE))
  const safePage = Math.min(page, totalPages)

  const [dueCards, recentCards, documents] = await Promise.all([
    db.flashcard.findMany({
      where: { userId: session.userId, dueAt: { lte: new Date() } },
      orderBy: { dueAt: 'asc' },
      take: 20,
      select: {
        id: true,
        question: true,
        answer: true,
        easeFactor: true,
      },
    }),
    db.flashcard.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      skip: (safePage - 1) * PER_PAGE,
      take: PER_PAGE,
      select: {
        id: true,
        question: true,
        answer: true,
        document: { select: { title: true } },
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
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Flashcards</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Review due cards. Spaced repetition schedules the next review.
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-white">Due now</h2>
        <FlashcardReview cards={dueCards} />
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Generate flashcards
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Pick a document and the AI creates a fresh deck from it.
        </p>

        {documents.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            Upload a document first to generate flashcards.
          </p>
        ) : (
          <GenerateFlashcardForm documents={documents} />
        )}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-white">
          Recent cards ({recentCardCount})
        </h2>
        {recentCards.length === 0 ? (
          <p className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            No flashcards yet. Generate some above.
          </p>
        ) : (
          <>
            <div className="space-y-3">
              {recentCards.map((card) => (
                <details
                  key={card.id}
                  className="rounded-2xl border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <summary className="cursor-pointer text-sm font-medium text-zinc-700 dark:text-zinc-200">
                    {card.question}
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {card.answer}
                  </p>
                  {card.document && (
                    <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-600">
                      from {card.document.title}
                    </p>
                  )}
                </details>
              ))}
            </div>
            <Pagination
              page={safePage}
              totalPages={totalPages}
              basePath="/flashcards"
            />
          </>
        )}
      </div>
    </div>
  )
}
