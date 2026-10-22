import { streamText, type ModelMessage } from 'ai'
import { verifySession } from '@/lib/dal'
import { db } from '@/lib/db'
import { searchChunks } from '@/lib/rag'
import { chatModel, isAiConfigured } from '@/lib/ai'
import { createLocalChatResponse, localStudyAnswer } from '@/lib/local-ai'
import { rateLimit } from '@/lib/rate-limit-db'
import {
  getChatHistory,
  pruneChatHistory,
  saveChatMessages,
  CHAT_CHANNEL_STUDY,
} from '@/lib/chat-history'

export const maxDuration = 30

type ClientMessage = {
  role: string
  content?: string
  parts?: Array<{ type?: string; text?: string }>
}

function toText(message: ClientMessage): string {
  if (typeof message.content === 'string') return message.content
  return (message.parts ?? [])
    .filter((p) => p.type === 'text' || p.type === 'reasoning')
    .map((p) => p.text ?? '')
    .join('')
}

export async function GET(req: Request) {
  const session = await verifySession()
  const { searchParams } = new URL(req.url)
  const documentId = searchParams.get('documentId')

  if (documentId) {
    const document = await db.document.findFirst({
      where: { id: documentId, userId: session.userId },
    })
    if (!document) {
      return Response.json({ error: 'Document not found' }, { status: 404 })
    }
  }

  const history = await getChatHistory(
    session.userId,
    CHAT_CHANNEL_STUDY,
    documentId,
  )

  return Response.json({
    messages: history
      .reverse()
      .map((m: { id: string; role: string; content: string }) => ({
        id: m.id,
        role: m.role,
        parts: [{ type: 'text' as const, text: m.content }],
      })),
  })
}

export async function POST(req: Request) {
  const session = await verifySession()

  if (!(await rateLimit(`chat:${session.userId}`, 30, 60 * 1000))) {
    return Response.json(
      { error: 'Too many messages. Wait a minute and try again.' },
      { status: 429 },
    )
  }

  const { messages, documentId } = await req.json()

  const document = await db.document.findFirst({
    where: { id: documentId, userId: session.userId },
  })

  if (!document) {
    return Response.json({ error: 'Document not found' }, { status: 404 })
  }

  if (document.status === 'PROCESSING') {
    return Response.json(
      { error: 'This document is still being indexed. Try again in a minute.' },
      { status: 409 },
    )
  }

  if (document.status === 'FAILED') {
    return Response.json(
      {
        error:
          'This document could not be indexed (usually an AI API issue). Delete it and upload again.',
      },
      { status: 409 },
    )
  }

  const lastUserMessage = [...messages]
    .reverse()
    .find((m: { role: string }) => m.role === 'user')

  const query =
    (lastUserMessage as ClientMessage | undefined)
      ?.parts?.filter((p) => p.type === 'text' && p.text)
      .map((p) => p.text as string)
      .join('') ?? toText((lastUserMessage as ClientMessage | undefined) ?? { role: '' })

  const context = await searchChunks(documentId, query, 5)

  const contextText = context
    .map((c, i) => `[${i + 1}] ${c.content}`)
    .join('\n\n')

  const coreMessages = messages.map((m: ClientMessage) => ({
    role: m.role,
    content: toText(m),
  })) as unknown as ModelMessage[]

  const persistedMessages = coreMessages
    .filter((m) => m.role === 'user')
    .slice(-1) as Array<{ role: string; content: string }>

  if (!isAiConfigured()) {
    const answer = localStudyAnswer(
      query,
      context.map((chunk) => ({
        title: document.title,
        content: chunk.content,
      })),
    )

    try {
      await saveChatMessages(
        session.userId,
        CHAT_CHANNEL_STUDY,
        documentId,
        [...persistedMessages, { role: 'assistant', content: answer }],
      )
      await pruneChatHistory(session.userId, CHAT_CHANNEL_STUDY, documentId)
    } catch (error) {
      console.error('[chat] failed to persist history:', error)
    }

    return createLocalChatResponse(answer)
  }

  const result = streamText({
    model: chatModel,
    system: `You are an expert study tutor helping a student understand "${document.title}".
Answer based ONLY on the provided context from their document.
If the answer is not in the context, say so honestly rather than guessing.
When you use information from the context, cite the segment number in brackets like [1].

CONTEXT:
${contextText}`,
    messages: coreMessages,
    onFinish: async ({ text }) => {
      try {
        await saveChatMessages(
          session.userId,
          CHAT_CHANNEL_STUDY,
          documentId,
          [...persistedMessages, { role: 'assistant', content: text }],
        )
        await pruneChatHistory(
          session.userId,
          CHAT_CHANNEL_STUDY,
          documentId,
        )
      } catch (error) {
        console.error('[chat] failed to persist history:', error)
      }
    },
  })

  return result.toUIMessageStreamResponse()
}
