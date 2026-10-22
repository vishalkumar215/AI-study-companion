import { streamText, type ModelMessage } from 'ai'
import { verifySession } from '@/lib/dal'
import { searchAllChunks } from '@/lib/rag'
import { chatModel, isAiConfigured } from '@/lib/ai'
import { createLocalChatResponse, localGlobalAnswer } from '@/lib/local-ai'
import { rateLimit } from '@/lib/rate-limit-db'
import {
  getChatHistory,
  pruneChatHistory,
  saveChatMessages,
  CHAT_CHANNEL_GLOBAL,
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

export async function GET() {
  const session = await verifySession()

  const history = await getChatHistory(session.userId, CHAT_CHANNEL_GLOBAL, null)

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

  if (!(await rateLimit(`global-chat:${session.userId}`, 30, 60 * 1000))) {
    return Response.json(
      { error: 'Too many messages. Wait a minute and try again.' },
      { status: 429 },
    )
  }

  const { messages } = await req.json()

  const lastUserMessage = [...messages]
    .reverse()
    .find((m: { role: string }) => m.role === 'user')

  const query = toText((lastUserMessage as ClientMessage | undefined) ?? { role: '' })

  const results = await searchAllChunks(session.userId, query, 8)

  const contextText = results
    .map(
      (r, i) =>
        `[${i + 1}] (from "${r.documentTitle}")\n${r.content}`,
    )
    .join('\n\n')

  const coreMessages = messages.map((m: ClientMessage) => ({
    role: m.role,
    content: toText(m),
  })) as unknown as ModelMessage[]

  const persistedMessages = coreMessages
    .filter((m) => m.role === 'user')
    .slice(-1) as Array<{ role: string; content: string }>

  if (!isAiConfigured()) {
    const answer = localGlobalAnswer(
      query,
      results.map((result) => ({
        documentTitle: result.documentTitle,
        content: result.content,
      })),
    )

    try {
      await saveChatMessages(
        session.userId,
        CHAT_CHANNEL_GLOBAL,
        null,
        [...persistedMessages, { role: 'assistant', content: answer }],
      )
      await pruneChatHistory(session.userId, CHAT_CHANNEL_GLOBAL, null)
    } catch (error) {
      console.error('[global-chat] failed to persist history:', error)
    }

    return createLocalChatResponse(answer)
  }

  const system =
    results.length === 0
      ? `You are an expert study tutor. The user asked a question but no matching material was found in their uploaded documents. Answer helpfully, and suggest uploading relevant study material if the answer depends on their own notes.`
      : `You are an expert study tutor answering questions using the student's own uploaded documents.
Answer based ONLY on the provided context. If the answer is not in the context, say so honestly rather than guessing.
Each context segment is labeled like [1] with the source document in quotes.
When you use information from a segment, cite it like [1]. If you combine information from several segments, cite each one.

CONTEXT:
${contextText}`

  const result = streamText({
    model: chatModel,
    system,
    messages: coreMessages,
    onFinish: async ({ text }) => {
      try {
        await saveChatMessages(
          session.userId,
          CHAT_CHANNEL_GLOBAL,
          null,
          [...persistedMessages, { role: 'assistant', content: text }],
        )
        await pruneChatHistory(session.userId, CHAT_CHANNEL_GLOBAL, null)
      } catch (error) {
        console.error('[global-chat] failed to persist history:', error)
      }
    },
  })

  return result.toUIMessageStreamResponse()
}
