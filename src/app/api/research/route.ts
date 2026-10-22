import { streamText, isStepCount, type ModelMessage } from 'ai'
import { verifySession } from '@/lib/dal'
import { chatModel, isAiConfigured, researchSearchTool } from '@/lib/ai'
import { createLocalChatResponse, localResearchAnswer } from '@/lib/local-ai'
import { rateLimit } from '@/lib/rate-limit-db'
import {
  getChatHistory,
  pruneChatHistory,
  saveChatMessages,
  CHAT_CHANNEL_RESEARCH,
} from '@/lib/chat-history'

export const maxDuration = 60

function toText(message: {
  role: string
  content?: string
  parts?: Array<{ type?: string; text?: string }>
}) {
  if (typeof message.content === 'string') {
    return { role: message.role, content: message.content }
  }
  return {
    role: message.role,
    content: (message.parts ?? [])
      .filter((p) => p.type === 'text' || p.type === 'reasoning')
      .map((p) => p.text ?? '')
      .join(''),
  }
}

export async function GET() {
  const session = await verifySession()

  const history = await getChatHistory(
    session.userId,
    CHAT_CHANNEL_RESEARCH,
    null,
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

  const { messages } = await req.json()

  if (!(await rateLimit(`research:${session.userId}`, 30, 60 * 1000))) {
    return Response.json(
      { error: 'Too many messages. Wait a minute and try again.' },
      { status: 429 },
    )
  }

  const coreMessages = (
    messages as Array<{
      role: string
      content?: string
      parts?: Array<{ type?: string; text?: string }>
    }>
  ).map(toText) as unknown as ModelMessage[]

  if (!isAiConfigured()) {
    const answer = localResearchAnswer()

    try {
      await saveChatMessages(session.userId, CHAT_CHANNEL_RESEARCH, null, [
        ...(coreMessages
          .filter((m) => m.role === 'user')
          .slice(-1) as Array<{ role: string; content: string }>),
        { role: 'assistant', content: answer },
      ])
      await pruneChatHistory(session.userId, CHAT_CHANNEL_RESEARCH, null)
    } catch (error) {
      console.error('[research] failed to persist history:', error)
    }

    return createLocalChatResponse(answer)
  }

  const hasSearch =
    researchSearchTool !== null
      ? 'Use the google_search tool when the question needs current, up-to-date, or factual information beyond your knowledge.\nWhen you rely on search results, note briefly that the information comes from the web.'
      : 'Answer from your own knowledge. You do not have live web search available, so do not claim to provide current information.'

  const system = `You are a friendly, knowledgeable research assistant. Answer questions clearly and helpfully, like a general-purpose AI assistant.
${hasSearch}
Be concise but thorough, and structure long answers with short paragraphs.`

  const result = streamText({
    model: chatModel,
    system,
    messages: coreMessages,
    tools: researchSearchTool ? { google_search: researchSearchTool } : undefined,
    stopWhen: researchSearchTool ? isStepCount(4) : undefined,
    onError: (error) => {
      console.error('[research] stream error:', error)
    },
    onFinish: async ({ text }) => {
      try {
        await saveChatMessages(
          session.userId,
          CHAT_CHANNEL_RESEARCH,
          null,
          [
            ...(coreMessages
              .filter((m) => m.role === 'user')
              .slice(-1) as Array<{ role: string; content: string }>),
            { role: 'assistant', content: text },
          ],
        )
        await pruneChatHistory(session.userId, CHAT_CHANNEL_RESEARCH, null)
      } catch (error) {
        console.error('[research] failed to persist history:', error)
      }
    },
  })

  return result.toUIMessageStreamResponse()
}
