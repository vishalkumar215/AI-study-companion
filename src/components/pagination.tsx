import Link from 'next/link'

const linkClass =
  'rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-200 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800'
const disabledClass =
  'rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-400 dark:border-zinc-800 dark:text-zinc-600'
const activeClass =
  'rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white'

export function Pagination({
  page,
  totalPages,
  basePath,
}: {
  page: number
  totalPages: number
  basePath: string
}) {
  if (totalPages <= 1) return null

  const pages: number[] = []
  for (let i = 1; i <= totalPages; i++) pages.push(i)

  return (
    <nav
      aria-label="Pagination"
      className="mt-6 flex flex-wrap items-center justify-center gap-1.5"
    >
      {page > 1 ? (
        <Link href={`${basePath}?page=${page - 1}`} className={linkClass}>
          ← Prev
        </Link>
      ) : (
        <span className={disabledClass}>← Prev</span>
      )}

      {pages.map((p) =>
        p === page ? (
          <span key={p} className={activeClass}>
            {p}
          </span>
        ) : (
          <Link key={p} href={`${basePath}?page=${p}`} className={linkClass}>
            {p}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link href={`${basePath}?page=${page + 1}`} className={linkClass}>
          Next →
        </Link>
      ) : (
        <span className={disabledClass}>Next →</span>
      )}
    </nav>
  )
}
