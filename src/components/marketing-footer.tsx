import Link from 'next/link'

const productLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
]

const accountLinks = [
  { href: '/signup', label: 'Create account' },
  { href: '/login', label: 'Log in' },
  { href: '/forgot-password', label: 'Forgot password' },
]

const featureLinks = [
  { href: '/#features', label: 'Upload documents' },
  { href: '/#features', label: 'Chat with your notes' },
  { href: '/#features', label: 'Smart flashcards' },
  { href: '/#features', label: 'Auto-generated quizzes' },
]

export function MarketingFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white">
                S
              </span>
              <span className="text-lg font-bold text-zinc-900 dark:text-white">
                StudyMate AI
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              Your AI learning companion. Upload study material and turn it
              into instant answers, flashcards, and quizzes.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Product
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="transition hover:text-zinc-900 dark:hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Account
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
              {accountLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="transition hover:text-zinc-900 dark:hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Features
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
              {featureLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="transition hover:text-zinc-900 dark:hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-zinc-200 pt-6 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400 sm:flex-row">
          <p>
            © {new Date().getFullYear()} StudyMate AI. All rights reserved.
          </p>
          <p>Made for learners, powered by AI.</p>
        </div>
      </div>
    </footer>
  )
}
