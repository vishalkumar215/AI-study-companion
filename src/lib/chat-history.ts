import 'server-only'

import { db } from '@/lib/db'

export const CHAT_CHANNEL_STUDY = 'study'
export const CHAT_CHANNEL_RESEARCH = 'research'
export const CHAT_CHANNEL_GLOBAL = 'global'

export async function saveChatMessages(
  userId: string,
  channel: string,
  documentId: string | null,
  messages: Array<{ role: string; content: string }>,
) {
  const rows = messages
    .map((m) => ({
      userId,
      channel,
      documentId,
      role: m.role,
      content: m.content.slice(0, 100_000),
    }))
    .filter((m) => m.content.trim().length > 0)

  if (rows.length === 0) return

  await db.chatMessage.createMany({ data: rows })
}

export async function getChatHistory(
  userId: string,
  channel: string,
  documentId: string | null,
  limit = 40,
) {
  return db.chatMessage.findMany({
    where: {
      userId,
      channel,
      ...(documentId ? { documentId } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function pruneChatHistory(
  userId: string,
  channel: string,
  documentId: string | null,
  keep = 100,
) {
  const oldMessages = await db.chatMessage.findMany({
    where: {
      userId,
      channel,
      ...(documentId ? { documentId } : {}),
    },
    orderBy: { createdAt: 'desc' },
    skip: keep,
    select: { id: true },
  })
  if (oldMessages.length === 0) return

  await db.chatMessage.deleteMany({
    where: { id: { in: oldMessages.map((m) => m.id) } },
  })
}
