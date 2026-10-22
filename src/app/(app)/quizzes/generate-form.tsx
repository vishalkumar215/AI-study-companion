'use client'

import { useActionState } from 'react'
import { generateQuiz, type QuizActionState } from '@/lib/quizzes'

export function GenerateQuizForm({
  documents,
}: {
  documents: { id: string; title: string }[]
}) {
  const [state, action, pending] = useActionState<QuizActionState, FormData>(
    generateQuiz,
    undefined,
  )

  return (
    <form action={action} className="mt-4 flex flex-wrap gap-3">
      <select
        name="documentId"
        required
        className="flex-1 rounded-lg border border-zinc-300 bg-zinc-100 px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
      >
        {documents.map((doc) => (
          <option key={doc.id} value={doc.id}>
            {doc.title}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
      >
        {pending ? 'Generating…' : 'Generate quiz'}
      </button>
      {state?.error && (
        <p className="w-full rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
    </form>
  )
}
