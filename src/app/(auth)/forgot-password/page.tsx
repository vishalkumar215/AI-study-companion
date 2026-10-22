'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { requestPasswordReset, type ResetRequestState } from '@/lib/auth'
import { ErrorAutoReload } from '@/components/error-auto-reload'

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState<
    ResetRequestState,
    FormData
  >(requestPasswordReset, undefined)

  return (
    <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <ErrorAutoReload errors={state?.errors} />
        {state?.success ? (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Check your email</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              If an account exists for that email, a 6-digit code is on its way.
              It expires in 15 minutes.
            </p>

            {state.previewOtp && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-center dark:border-amber-700 dark:bg-amber-950/40">
                <p className="text-xs font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400">
                  Email is not configured — dev preview code
                </p>
                <p className="mt-1 font-mono text-3xl font-bold tracking-[0.3em] text-zinc-900 dark:text-white">
                  {state.previewOtp}
                </p>
              </div>
            )}

            <Link
              href="/reset-password"
              className="block w-full rounded-lg bg-indigo-600 py-2 text-center font-medium text-white transition hover:bg-indigo-500"
            >
              I have a code — reset password
            </Link>
            <Link
              href="/login"
              className="block w-full rounded-lg border border-zinc-300 py-2 text-center font-medium text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Forgot your password?</h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Enter your account email and a reset code will be sent to it.
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
                {pending ? 'Sending code…' : 'Send reset code'}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Remembered it?{' '}
              <Link href="/login" className="text-indigo-600 hover:underline dark:text-indigo-400">
                Log in
              </Link>
            </p>
          </>
        )}
      </div>
  )
}
