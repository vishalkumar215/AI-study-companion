import Link from 'next/link'
import { verifySession } from '@/lib/dal'
import { db } from '@/lib/db'
import { ProcessingPoller } from '../documents/processing-poller'

export default async function StudyPage() {
  const session = await verifySession()

  const [documents, indexing] = await Promise.all([
    db.document.findMany({
      where: { userId: session.userId, status: 'PROCESSED' },
      orderBy: { createdAt: 'desc' },
      include: { chunks: true },
    }),
    db.document.findMany({
      where: { userId: session.userId, status: 'PROCESSING' },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true },
    }),
  ])

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Study with AI</h1>
          <Link
            href="/study/global"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
          >
            Chat with everything
          </Link>
        </div>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Pick a document and ask questions. The AI answers using only your
          material.
        </p>
      </div>

      <ProcessingPoller hasProcessing={indexing.length > 0} />

      {indexing.length > 0 && (
        <div className="rounded-2xl border border-amber-300 bg-amber-500/10 p-5 dark:border-amber-800">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
            Indexing {indexing.length === 1 ? '1 document' : `${indexing.length} documents`}…
          </p>
          <ul className="mt-2 space-y-1 text-sm text-amber-700 dark:text-amber-400">
            {indexing.map((document) => (
              <li key={document.id}>
                {document.title} — this page updates automatically.
              </li>
            ))}
          </ul>
        </div>
      )}

      {documents.length === 0 ? (
        indexing.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No indexed documents yet.{' '}
              <Link href="/documents" className="text-indigo-600 hover:underline dark:text-indigo-400">
                Upload one first
              </Link>{' '}
              to start studying.
            </p>
          </div>
        ) : null
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {documents.map((doc) => (
            <Link
              key={doc.id}
              href={`/study/${doc.id}`}
              className="rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-indigo-600 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <p className="font-semibold text-zinc-900 dark:text-white">{doc.title}</p>
              <p className="mt-1 text-xs text-zinc-500">{doc.chunks.length} chunks</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
