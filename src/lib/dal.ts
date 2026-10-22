import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/session'
import { db } from '@/lib/db'

export const verifySession = cache(async () => {
  const cookieStore = await cookies()
  const cookie = cookieStore.get('session')?.value
  const session = await decrypt(cookie)

  if (!session?.userId || typeof session.sessionVersion !== 'number') {
    cookieStore.delete('session')
    redirect('/login')
  }

  const user = await db.user.findUnique({
    where: { id: session.userId as string },
    select: { sessionVersion: true },
  })

  if (!user || user.sessionVersion !== session.sessionVersion) {
    cookieStore.delete('session')
    redirect('/login')
  }

  return { isAuth: true, userId: session.userId as string }
})

export const getUser = cache(async () => {
  const session = await verifySession()

  try {
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { id: true, name: true, email: true },
    })
    return user
  } catch {
    return null
  }
})
