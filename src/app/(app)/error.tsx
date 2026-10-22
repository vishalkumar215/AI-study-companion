'use client'

import { useEffect } from 'react'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[app] page error:', error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/5 p-10 text-center">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
        Something went wrong
      </h2>
      <p className="mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
        An unexpected error occurred while loading this page. Try again, or
        refresh to continue.
      </p>
      <button
        onClick={reset}
        className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
      >
        Try again
      </button>
    </div>
  )
}
