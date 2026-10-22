import Link from 'next/link'
import { Reveal } from '@/components/reveal'

const principles = [
  {
    title: 'Your material, your context',
    desc: 'StudyMate answers from your own documents using retrieval-augmented generation (RAG) — never from vague memory of the internet.',
  },
  {
    title: 'Built on learning science',
    desc: 'Flashcards follow the SM-2 spaced-repetition algorithm, so you review each concept right when you are about to forget it.',
  },
  {
    title: 'Private by default',
    desc: 'Everything you upload is scoped to your account. Your notes power your study tools and nothing else.',
  },
  {
    title: 'Works in your workflow',
    desc: 'PDFs, Markdown, and text files are supported. Upload from your laptop and study on any device with a browser.',
  },
]

const stack = [
  'Next.js 16',
  'TypeScript',
  'Tailwind CSS',
  'Prisma + SQLite',
  'Vercel AI SDK',
  'Google Gemini',
]

export default function AboutPage() {
  return (
    <div className="overflow-hidden">
      <section className="relative py-20 lg:py-28">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -right-24 top-0 h-80 w-80 rounded-full bg-violet-400/20 blur-3xl animate-blob dark:bg-violet-600/15" />
          <div className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl animate-blob dark:bg-indigo-600/15" style={{ animationDelay: '3s' }} />
        </div>

        <div className="mx-auto w-full max-w-6xl px-6 text-center">
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
            About StudyMate AI
          </div>
          <h1
            className="animate-fade-up mx-auto mt-5 max-w-3xl text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl"
            style={{ animationDelay: '100ms' }}
          >
            We turn study material into a{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
              personal learning system
            </span>
          </h1>
          <p
            className="animate-fade-up mx-auto mt-5 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400"
            style={{ animationDelay: '200ms' }}
          >
            StudyMate AI is a retrieval-augmented study app. Upload a PDF,
            Markdown file, or text notes, and it builds you an AI-powered study
            companion: chat over your documents, auto-generated flashcards, and
            practice quizzes — all grounded in your own material.
          </p>
        </div>
      </section>

      <section className="bg-zinc-50 py-20 dark:bg-zinc-900/40">
        <div className="mx-auto w-full max-w-6xl px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              What we believe
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
              Four principles behind the app
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {principles.map((item, i) => (
              <Reveal key={item.title} delay={i * 100}>
                <div className="h-full rounded-2xl border border-zinc-200 bg-white p-6 transition hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {item.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
              The pipeline behind your study tools
            </h2>
            <div className="mt-6 space-y-5">
              {[
                {
                  title: 'Extract & chunk',
                  desc: 'Uploaded files are parsed into text and split into overlapping chunks so no idea gets lost.',
                },
                {
                  title: 'Embed & index',
                  desc: 'Each chunk gets a vector embedding, storing semantic meaning that can be searched instantly.',
                },
                {
                  title: 'Retrieve & answer',
                  desc: 'When you ask a question, we find the most relevant chunks and let the AI answer from exactly those.',
                },
                {
                  title: 'Generate & schedule',
                  desc: 'Flashcards and quizzes are built from the key topics of your document, and reviews are spaced over time.',
                },
              ].map((step) => (
                <div key={step.title} className="flex gap-4">
                  <span className="mt-1 flex h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-500" />
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-white">
                      {step.title}
                    </p>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-8 dark:border-zinc-800 dark:bg-zinc-900/60">
              <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Tech stack
              </p>
              <ul className="mt-5 grid grid-cols-2 gap-3">
                {stack.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Built with modern, boring-proven technology and a free-tier AI
                provider, so the product stays fast, simple, and accessible.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-zinc-50 py-20 dark:bg-zinc-900/40">
        <div className="mx-auto w-full max-w-6xl px-6 text-center">
          <Reveal>
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
              Want to know more?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-zinc-600 dark:text-zinc-400">
              Browse our FAQ for common questions, or get in touch if you need
              a hand getting started.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/faq"
                className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                Read the FAQ
              </Link>
              <Link
                href="/contact"
                className="rounded-xl border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Contact us
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
