import { notFound } from 'next/navigation'
import Link from 'next/link'
import { verifySession } from '@/lib/dal'
import { db } from '@/lib/db'

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await verifySession()

  const document = await db.document.findFirst({
    where: { id, userId: session.userId },
    include: { chunks: { orderBy: { seq: 'asc' } } },
  })

  if (!document) notFound()

  const wordCount = document.content.split(/\s+/).length

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/documents"
          className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
        >
          ← Back to documents
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">{document.title}</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {document.fileName} · {document.chunks.length} chunks · {wordCount}{' '}
          words · uploaded {document.createdAt.toLocaleDateString()}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {document.status !== 'PROCESSED' ? (
          <span className="rounded-xl border border-amber-300 bg-amber-500/10 px-4 py-2.5 text-sm font-medium text-amber-700 dark:border-amber-800 dark:text-amber-300">
            {document.status === 'FAILED'
              ? 'Indexing failed — delete and re-upload this document.'
              : 'Still indexing… this usually takes less than a minute.'}
          </span>
        ) : (
          <Link
            href={`/study/${document.id}`}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
          >
            Study with AI
          </Link>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-white">
          Chunks ({document.chunks.length})
        </h2>
        <div className="space-y-3">
          {document.chunks.map((chunk) => (
            <details
              key={chunk.id}
              className="rounded-2xl border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <summary className="cursor-pointer text-sm font-medium text-zinc-600 dark:text-zinc-300">
                Chunk {chunk.seq + 1} · {chunk.tokenCount} tokens
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                {chunk.content.length > 600
                  ? `${chunk.content.slice(0, 600)}…`
                  : chunk.content}
              </p>
            </details>
          ))}
        </div>
      </div>
    </div>
  )
}
