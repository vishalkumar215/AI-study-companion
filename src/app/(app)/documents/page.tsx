import Link from 'next/link'
import { verifySession } from '@/lib/dal'
import { db } from '@/lib/db'
import { deleteDocument } from '@/lib/documents'
import { requeueStaleDocuments } from '@/lib/processing'
import { UploadForm } from './upload-form'
import { ProcessingPoller } from './processing-poller'

export default async function DocumentsPage() {
  const session = await verifySession()
  await requeueStaleDocuments(session.userId)

  const documents = await db.document.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      fileName: true,
      status: true,
      createdAt: true,
      _count: { select: { chunks: true } },
    },
  })

  const processingCount = documents.filter(
    (d) => d.status === 'PROCESSING',
  ).length

  return (
    <div className="space-y-8">
      <ProcessingPoller hasProcessing={processingCount > 0} />

      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Documents</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Your study material, indexed and ready to query.
        </p>
      </div>

      <UploadForm />

      <div>
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
          Your documents ({documents.length})
        </h2>

        {documents.length === 0 ? (
          <p className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            Nothing here yet. Upload a PDF, Markdown, or TXT file above.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <Link
                  href={`/documents/${doc.id}`}
                  className="text-base font-semibold text-zinc-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
                >
                  {doc.title}
                </Link>
                <p className="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {doc.fileName} · {doc._count.chunks} chunks ·{' '}
                  {doc.createdAt.toLocaleDateString()}
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      doc.status === 'PROCESSED'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : doc.status === 'FAILED'
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {doc.status === 'PROCESSING'
                      ? 'Indexing…'
                      : doc.status === 'FAILED'
                        ? 'Failed to index'
                        : doc.status}
                  </span>
                  {doc.status === 'PROCESSED' ? (
                    <Link
                      href={`/study/${doc.id}`}
                      className="ml-auto rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-500"
                    >
                      Study with AI
                    </Link>
                  ) : (
                    <span className="ml-auto" />
                  )}
                  <form action={deleteDocument}>
                    <input type="hidden" name="id" value={doc.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-500 transition hover:border-red-500/50 hover:text-red-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-red-400"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
