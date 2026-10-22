'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/lib/auth'
import { ThemeToggle } from '@/components/theme-toggle'

const nav = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/documents', label: 'Documents' },
  { href: '/study', label: 'Study' },
  { href: '/research', label: 'Research' },
  { href: '/flashcards', label: 'Flashcards' },
  { href: '/quizzes', label: 'Quizzes' },
  { href: '/account', label: 'Account' },
]

export function Sidebar({
  userName,
  userEmail,
}: {
  userName: string
  userEmail: string
}) {
  const pathname = usePathname()

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
        <Link href="/" className="block">
          <p className="text-lg font-bold text-zinc-900 dark:text-white">
            StudyMate AI
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            AI Learning Companion
          </p>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {nav.map((item) => {
          const active =
            item.href === '/dashboard'
              ? pathname === item.href
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? 'bg-indigo-600 text-white'
                  : 'text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-zinc-200 px-5 py-4 dark:border-zinc-800">
        <ThemeToggle />
        <p className="mt-3 truncate text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {userName}
        </p>
        <p className="truncate text-xs text-zinc-500 dark:text-zinc-500">
          {userEmail}
        </p>
        <form action={logout} className="mt-3">
          <button
            type="submit"
            className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-600 transition hover:bg-zinc-200 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Log out
          </button>
        </form>
      </div>
    </aside>
  )
}
