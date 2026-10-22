'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { resetPassword, type ResetState } from '@/lib/auth'
import { ErrorAutoReload } from '@/components/error-auto-reload'

export default function ResetPasswordPage() {
  const [state, action, pending] = useActionState<ResetState, FormData>(
    resetPassword,
    undefined,
  )

  return (
    <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <ErrorAutoReload errors={state?.errors} />
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Set a new password</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Enter the code we emailed you, plus your new password.
        </p>

        <form action={action} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-zinc-600 dark:text-zinc-300"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-zinc-100 px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500"
            />
            {state?.errors?.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {state.errors.email[0]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-zinc-600 dark:text-zinc-300"
            >
              Reset code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              maxLength={6}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-zinc-100 px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500"
            />
            {state?.errors?.code && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {state.errors.code[0]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-zinc-600 dark:text-zinc-300"
            >
              New password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              placeholder="At least 6 characters"
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-zinc-100 px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500"
            />
            {state?.errors?.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {state.errors.password[0]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-zinc-600 dark:text-zinc-300"
            >
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              placeholder="Repeat your new password"
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-zinc-100 px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500"
            />
            {state?.errors?.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {state.errors.confirmPassword[0]}
              </p>
            )}
          </div>

          {state?.errors?.form && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
              {state.errors.form[0]}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-indigo-600 py-2 font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
          >
            {pending ? 'Resetting…' : 'Reset password'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Didn&apos;t get a code?{' '}
          <Link
            href="/forgot-password"
            className="text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Request another
          </Link>
        </p>
      </div>
  )
}
