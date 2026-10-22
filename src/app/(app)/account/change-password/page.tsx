import Link from 'next/link'
import { ChangePasswordForm } from './change-password-form'

export default function ChangePasswordPage() {
  return (
    <div className="mx-auto w-full max-w-md">
      <Link
        href="/account"
        className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
      >
        ← Back to profile
      </Link>

      <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Change password
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Use at least 6 characters
        </p>

        <ChangePasswordForm />
      </div>
    </div>
  )
}
