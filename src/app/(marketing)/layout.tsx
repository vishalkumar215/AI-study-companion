import { cookies } from 'next/headers'
import { decrypt } from '@/lib/session'
import { db } from '@/lib/db'
import { MarketingHeader } from '@/components/marketing-header'
import { MarketingFooter } from '@/components/marketing-footer'

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie)

  let user: { name: string; email: string } | null = null
  if (
    session?.userId &&
    typeof session.sessionVersion === 'number'
  ) {
    const found = await db.user.findUnique({
      where: { id: session.userId as string },
      select: { name: true, email: true, sessionVersion: true },
    })
    if (found && found.sessionVersion === session.sessionVersion) {
      user = { name: found.name, email: found.email }
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
      <MarketingHeader user={user} />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  )
}
