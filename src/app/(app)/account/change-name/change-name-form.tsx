'use client'

import { useActionState } from 'react'
import { changeName, type ChangeNameState } from '@/lib/auth'
import { ErrorAutoReload } from '@/components/error-auto-reload'

export function ChangeNameForm({ currentName }: { currentName: string }) {
  const [state, action, pending] = useActionState<ChangeNameState, FormData>(
    changeName,
    undefined,
  )

  return (
    <form action={action} className="mt-6 space-y-4">
      <ErrorAutoReload errors={state?.errors} />
      {state?.success && (
        <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
          Name updated.
        </p>
      )}

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-zinc-600 dark:text-zinc-300"
        >
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          autoComplete="name"
          defaultValue={currentName}
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-zinc-100 px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500"
        />
        {state?.errors?.name && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {state.errors.name[0]}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-indigo-600 py-2 font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
      >
        {pending ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  )
}
