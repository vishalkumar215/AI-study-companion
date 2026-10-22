import Link from 'next/link'
import { getUser } from '@/lib/dal'
import { ChangeNameForm } from './change-name-form'

export default async function ChangeNamePage() {
  const user = await getUser()

  if (!user) {
    return null
  }

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
          Change name
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Update the name shown on your profile
        </p>

        <ChangeNameForm currentName={user.name} />
      </div>
    </div>
  )
}
