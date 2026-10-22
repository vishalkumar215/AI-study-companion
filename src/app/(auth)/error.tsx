'use client'

export default function AuthError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-10 text-center">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
        Something went wrong
      </h2>
      <button
        onClick={reset}
        className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
      >
        Try again
      </button>
    </div>
  )
}
