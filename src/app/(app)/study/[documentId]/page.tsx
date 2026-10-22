import { notFound } from 'next/navigation'
import Link from 'next/link'
import { verifySession } from '@/lib/dal'
import { db } from '@/lib/db'
import { Chat } from './chat'

export default async function StudyChatPage({
  params,
}: {
  params: Promise<{ documentId: string }>
}) {
  const { documentId } = await params
  const session = await verifySession()

  const document = await db.document.findFirst({
    where: { id: documentId, userId: session.userId },
    select: { id: true, title: true },
  })

  if (!document) notFound()

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex items-center justify-between pb-4">
        <div>
          <Link
            href="/study"
            className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
          >
            ← All documents
          </Link>
          <h1 className="mt-1 text-xl font-bold text-zinc-900 dark:text-white">
            {document.title}
          </h1>
        </div>
      </div>

      <Chat key={document.id} documentId={document.id} />
    </div>
  )
}
