import Link from 'next/link'
import { verifySession } from '@/lib/dal'
import { db } from '@/lib/db'
import { getDashboardAnalytics } from '@/lib/analytics'

export default async function DashboardPage() {
  const session = await verifySession()

  const [documentCount, dueCards, quizCount, totalCards, analytics] =
    await Promise.all([
      db.document.count({ where: { userId: session.userId } }),
      db.flashcard.count({
        where: { userId: session.userId, dueAt: { lte: new Date() } },
      }),
      db.quiz.count({ where: { userId: session.userId } }),
      db.flashcard.count({ where: { userId: session.userId } }),
      getDashboardAnalytics(session.userId),
    ])

  const recentDocuments = await db.document.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, title: true, createdAt: true },
  })

  const stats = [
    { label: 'Documents', value: documentCount, href: '/documents' },
    { label: 'Cards due today', value: dueCards, href: '/flashcards' },
    { label: 'Flashcards', value: totalCards, href: '/flashcards' },
    { label: 'Quizzes', value: quizCount, href: '/quizzes' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Upload material, chat with it, and review what you learned.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
          >
            <p className="text-3xl font-bold text-zinc-900 dark:text-white">{stat.value}</p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Study streak</p>
          <p className="mt-1 text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            {analytics.streakDays} {analytics.streakDays === 1 ? 'day' : 'days'}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Cards learned</p>
          <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-white">
            {analytics.cardsLearned}
            <span className="ml-1 text-sm font-medium text-zinc-500">
              of {totalCards}
            </span>
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Avg quiz score</p>
          <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-white">
            {analytics.quizzesTaken > 0 ? `${analytics.quizAverage}%` : '—'}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {analytics.quizzesTaken} {analytics.quizzesTaken === 1 ? 'quiz' : 'quizzes'} taken
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Reviews today</p>
          <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-white">
            {analytics.reviewsToday}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Activity — last 7 days
        </h2>
        <div className="mt-4 flex items-end gap-2">
          {analytics.last7Days.map((day) => {
            const total = day.reviews + day.quizzes
            const max = Math.max(
              1,
              ...analytics.last7Days.map((d) => d.reviews + d.quizzes),
            )
            const height = Math.round((total / max) * 120)
            const label = new Date(day.date + 'T00:00:00')
              .toLocaleDateString(undefined, { weekday: 'short' })
            return (
              <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                <p className="text-[10px] text-zinc-500">
                  {total > 0 ? total : ''}
                </p>
                <div
                  className={`w-full rounded-md ${
                    total > 0
                      ? 'bg-indigo-500'
                      : 'bg-zinc-200 dark:bg-zinc-800'
                  }`}
                  style={{ height: `${Math.max(4, height)}px` }}
                  title={`${day.date}: ${day.reviews} reviews, ${day.quizzes} quizzes`}
                />
                <p className="text-[10px] text-zinc-400">{label}</p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Quick actions</h2>
          <div className="mt-4 space-y-3">
            <Link
              href="/documents"
              className="block rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-500"
            >
              Upload a document
            </Link>
            <Link
              href="/study"
              className="block rounded-xl border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-200 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Study with AI
            </Link>
            <Link
              href="/flashcards"
              className="block rounded-xl border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-200 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Review flashcards
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Recent documents</h2>
            <Link
              href="/documents"
              className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
            >
              View all
            </Link>
          </div>
          {recentDocuments.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
              No documents yet. Upload your first study material.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800">
              {recentDocuments.map((doc) => (
                <li key={doc.id} className="py-3">
                  <Link
                    href={`/documents/${doc.id}`}
                    className="block truncate text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-200 dark:hover:text-white"
                  >
                    {doc.title}
                  </Link>
                  <p className="text-xs text-zinc-500">{doc.createdAt.toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
