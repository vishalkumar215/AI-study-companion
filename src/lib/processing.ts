import 'server-only'

import { db, syncChunkFtsInsert } from '@/lib/db'
import { getEmbeddings } from '@/lib/ai'

const queue: string[] = []
const queued = new Set<string>()
let running = false

export function enqueueDocumentProcessing(documentId: string) {
  if (queued.has(documentId)) return
  queued.add(documentId)
  queue.push(documentId)
  void drain()
}

async function drain() {
  if (running) return
  running = true
  try {
    while (queue.length > 0) {
      const id = queue.shift()
      queued.delete(id ?? '')
      if (id) {
        try {
          await processDocument(id)
        } catch (error) {
          console.error(`[processing] failed for ${id}:`, error)
        }
      }
    }
  } finally {
    running = false
  }
}

export async function processDocument(documentId: string) {
  const document = await db.document.findUnique({ where: { id: documentId } })
  if (!document || document.status !== 'PROCESSING') return

  const chunks = await db.chunk.findMany({
    where: { documentId },
    orderBy: { seq: 'asc' },
  })

  if (chunks.length === 0) {
    await db.document.update({
      where: { id: documentId },
      data: { status: 'FAILED' },
    })
    return
  }

  try {
    const embeddings = await getEmbeddings(chunks.map((c) => c.content))

    await db.$transaction(
      chunks.map((c, i) =>
        db.chunk.update({
          where: { id: c.id },
          data: { embedding: JSON.stringify(embeddings[i] ?? []) },
        }),
      ),
    )

    for (const chunk of chunks) {
      await syncChunkFtsInsert(chunk.id, chunk.content).catch(() => {})
    }

    await db.document.update({
      where: { id: documentId },
      data: { status: 'PROCESSED' },
    })
  } catch (error) {
    console.error(`[processing] embedding failed for ${documentId}:`, error)
    await db.document
      .update({ where: { id: documentId }, data: { status: 'FAILED' } })
      .catch(() => {})
  }
}

const STALE_MS = 60 * 1000

export async function requeueStaleDocuments(userId: string) {
  const stale = await db.document.findMany({
    where: {
      userId,
      status: 'PROCESSING',
      createdAt: { lt: new Date(Date.now() - STALE_MS) },
    },
    select: { id: true },
  })
  for (const doc of stale) {
    enqueueDocumentProcessing(doc.id)
  }
}
