import Link from 'next/link'
import { getUser } from '@/lib/dal'

export default async function AccountPage() {
  const user = await getUser()

  if (!user) {
    return null
  }

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Profile
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Your account details
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <dl className="divide-y divide-zinc-100 dark:divide-zinc-800">
          <div className="flex items-center justify-between gap-4 px-6 py-4">
            <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Name
            </dt>
            <dd className="truncate text-sm font-medium text-zinc-900 dark:text-white">
              {user.name}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 px-6 py-4">
            <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Email
            </dt>
            <dd className="truncate text-sm font-medium text-zinc-900 dark:text-white">
              {user.email}
            </dd>
          </div>
        </dl>
      </div>

      <div className="space-y-3">
        <Link
          href="/account/change-name"
          className="block rounded-lg border border-zinc-300 px-4 py-2.5 text-center text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Change name
        </Link>
        <Link
          href="/account/change-password"
          className="block rounded-lg border border-zinc-300 px-4 py-2.5 text-center text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Change password
        </Link>
        <Link
          href="/dashboard"
          className="block rounded-lg bg-indigo-600 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-indigo-500"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
