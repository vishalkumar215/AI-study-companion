'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { verifySession } from '@/lib/dal'
import { db, syncChunkFtsDelete } from '@/lib/db'
import { chunkText } from '@/lib/rag'
import { enqueueDocumentProcessing } from '@/lib/processing'

export type UploadState = { error?: string } | undefined

const MAX_FILE_SIZE = 10 * 1024 * 1024
const MAX_CHUNKS = 500
const ALLOWED_EXTENSIONS = ['pdf', 'txt', 'md', 'markdown']
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'text/plain',
  'text/markdown',
]

export async function uploadDocument(state: UploadState, formData: FormData) {
  const session = await verifySession()

  const file = formData.get('file') as File | null
  if (!file || file.size === 0) {
    return { error: 'Please choose a file to upload.' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: 'That file is too large — the maximum size is 10 MB.' }
  }

  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  const mime = file.type.toLowerCase()
  if (
    !ALLOWED_EXTENSIONS.includes(extension) &&
    !ALLOWED_MIME_TYPES.includes(mime)
  ) {
    return {
      error: 'Unsupported file type. Please upload a PDF, TXT, or Markdown file.',
    }
  }

  const title = String(formData.get('title') ?? '').trim() || file.name

  let documentId: string | null = null

  try {
    const text = await extractText(file)
    const chunks = chunkText(text)

    if (chunks.length === 0) {
      return { error: 'That file contains no readable text.' }
    }

    if (chunks.length > MAX_CHUNKS) {
      return {
        error: `That file is too long to index (it would create ${chunks.length} chunks; the limit is ${MAX_CHUNKS}). Try a shorter file.`,
      }
    }

    const document = await db.document.create({
      data: {
        userId: session.userId,
        title,
        fileName: file.name,
        fileType: file.type,
        content: text,
        status: 'PROCESSING',
      },
    })
    documentId = document.id

    // Chunks are saved immediately; embeddings are computed in the
    // background so large files don't block the request.
    await db.$transaction(
      chunks.map((content, index) =>
        db.chunk.create({
          data: {
            documentId: document.id,
            seq: index,
            content,
            embedding: '[]',
            tokenCount: content.split(/\s+/).length,
          },
        }),
      ),
    )

    enqueueDocumentProcessing(document.id)
  } catch (error) {
    console.error(error)
    if (documentId) {
      await db.document.delete({ where: { id: documentId } }).catch(() => {})
    }
    return {
      error:
        'Failed to read that file. Make sure it is a valid PDF, TXT, or Markdown file.',
    }
  }

  revalidatePath('/documents')
  revalidatePath('/dashboard')
  revalidatePath('/study')
  revalidatePath('/flashcards')
  revalidatePath('/quizzes')
  redirect('/documents')
}

export async function deleteDocument(formData: FormData) {
  const session = await verifySession()
  const id = String(formData.get('id') ?? '')

  const chunks = await db.chunk.findMany({
    where: { documentId: id },
    select: { id: true },
  })
  for (const chunk of chunks) {
    await syncChunkFtsDelete(chunk.id).catch(() => {})
  }

  await db.document.deleteMany({ where: { id, userId: session.userId } })
  revalidatePath('/documents')
  revalidatePath('/dashboard')
  revalidatePath('/study')
  revalidatePath('/flashcards')
  revalidatePath('/quizzes')
}

async function extractText(file: File): Promise<string> {
  const type = file.type || ''
  const name = file.name.toLowerCase()

  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    const { PDFParse } = await import('pdf-parse')
    const bytes = new Uint8Array(await file.arrayBuffer())
    const parser = new PDFParse({ data: bytes })
    try {
      const result = await parser.getText()
      return result.text
    } finally {
      await parser.destroy()
    }
  }

  return file.text()
}
