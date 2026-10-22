import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-100 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white">
              S
            </span>
            <span className="text-lg font-bold text-zinc-900 dark:text-white">
              StudyMate AI
            </span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-1 px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400 sm:flex-row">
          <p>
            © {new Date().getFullYear()} StudyMate AI. All rights reserved.
          </p>
          <p>Your AI Learning Companion</p>
        </div>
      </footer>
    </div>
  )
}
