import Link from 'next/link'
import { Reveal } from '@/components/reveal'

const features = [
  {
    title: 'Upload any study material',
    desc: 'Drop in PDFs, Markdown, or text files. We extract the content and index it so you can search and quiz yourself on it.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
  {
    title: 'Chat with your documents',
    desc: 'Ask questions about your notes and get answers drawn only from your own material — not from the general internet.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    title: 'Smart flashcards',
    desc: 'AI turns your notes into flashcards and uses spaced repetition to schedule reviews exactly when you are about to forget.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
  },
  {
    title: 'Auto-generated quizzes',
    desc: 'Get multiple-choice quizzes built from the key topics in your material, with instant scoring and explanations.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
]

const steps = [
  {
    num: '01',
    title: 'Upload your material',
    desc: 'Add a PDF, Markdown, or text file from your study notes, textbook chapter, or lecture slides.',
  },
  {
    num: '02',
    title: 'Let AI build your toolkit',
    desc: 'The material is chunked, embedded, and analyzed so it can power chat, flashcards, and quizzes.',
  },
  {
    num: '03',
    title: 'Learn and review daily',
    desc: 'Chat for understanding, then reinforce with spaced-repetition flashcards and practice quizzes.',
  },
]

const testimonials = [
  {
    quote:
      'I uploaded my entire textbook and now I can quiz myself on every chapter. My exam prep time dropped in half.',
    name: 'Priya S.',
    role: 'Medical student',
  },
  {
    quote:
      'The flashcards appear right when I start forgetting. It honestly feels like having a study buddy.',
    name: 'Marcus T.',
    role: 'CS graduate student',
  },
  {
    quote:
      'As a teacher, I use it to turn my lesson notes into quizzes my students actually enjoy.',
    name: 'Aisha R.',
    role: 'High school teacher',
  },
]

const stats = [
  { value: '10k+', label: 'Documents studied' },
  { value: '500k+', label: 'Flashcards reviewed' },
  { value: '4.9/5', label: 'Learner rating' },
]

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-indigo-400/30 blur-3xl animate-blob dark:bg-indigo-600/20" />
          <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-violet-400/20 blur-3xl animate-blob dark:bg-violet-600/15" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl animate-blob dark:bg-emerald-500/10" style={{ animationDelay: '4s' }} />
        </div>

        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pb-20 pt-20 lg:grid-cols-2 lg:pt-28">
          <div>
            <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse-ring" />
              Your AI Learning Companion
            </div>

            <h1
              className="animate-fade-up mt-5 text-4xl font-extrabold leading-tight tracking-tight text-zinc-900 dark:text-white sm:text-5xl lg:text-6xl"
              style={{ animationDelay: '100ms' }}
            >
              Study smarter with{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
                your own notes
              </span>
            </h1>

            <p
              className="animate-fade-up mt-5 max-w-xl text-lg text-zinc-600 dark:text-zinc-400"
              style={{ animationDelay: '200ms' }}
            >
              Upload any study material and instantly get AI answers,
              spaced-repetition flashcards, and practice quizzes — all built
              from what you already have.
            </p>

            <div
              className="animate-fade-up mt-8 flex flex-wrap items-center gap-3"
              style={{ animationDelay: '300ms' }}
            >
              <Link
                href="/signup"
                className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 hover:shadow-indigo-500/30"
              >
                Start learning free
              </Link>
              <Link
                href="#how-it-works"
                className="rounded-xl border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                See how it works
              </Link>
            </div>

            <dl
              className="animate-fade-up mt-10 grid max-w-md grid-cols-3 gap-4"
              style={{ animationDelay: '400ms' }}
            >
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="order-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {stat.label}
                  </dt>
                  <dd className="text-2xl font-bold text-zinc-900 dark:text-white">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Mockup */}
          <div className="animate-fade-up relative mx-auto w-full max-w-md" style={{ animationDelay: '250ms' }}>
            <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-2xl shadow-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-1.5 border-b border-zinc-200 pb-3 dark:border-zinc-800">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="ml-3 rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  studymate.ai/dashboard
                </span>
              </div>

              <div className="space-y-3 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                      Study plan
                    </p>
                    <p className="text-xs text-zinc-500">Today&apos;s review</p>
                  </div>
                  <span className="rounded-lg bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    12 due
                  </span>
                </div>

                <div className="flex gap-3">
                  {[
                    { label: 'Documents', value: 8, color: 'bg-indigo-500' },
                    { label: 'Flashcards', value: 120, color: 'bg-violet-500' },
                    { label: 'Quizzes', value: 15, color: 'bg-emerald-500' },
                  ].map((card) => (
                    <div
                      key={card.label}
                      className="flex-1 rounded-2xl border border-zinc-200 p-3 dark:border-zinc-800"
                    >
                      <div className={`h-2 w-8 rounded-full ${card.color}`} />
                      <p className="mt-2 text-lg font-bold text-zinc-900 dark:text-white">
                        {card.value}
                      </p>
                      <p className="text-[10px] text-zinc-500">{card.label}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-zinc-200 p-3 dark:border-zinc-800">
                  <p className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
                    Chat with your notes
                  </p>
                  <div className="mt-2 space-y-2">
                    <div className="ml-auto w-fit max-w-[80%] rounded-xl rounded-br-sm bg-indigo-600 px-3 py-1.5 text-xs text-white">
                      Summarize photosynthesis?
                    </div>
                    <div className="w-fit max-w-[85%] rounded-xl rounded-bl-sm bg-zinc-100 px-3 py-1.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                      Light reactions convert solar energy into ATP and NADPH…
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -right-4 -top-4 -z-10 h-full w-full rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-500 opacity-20 blur-2xl" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-zinc-50 py-24 dark:bg-zinc-900/40">
        <div className="mx-auto w-full max-w-6xl px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Features
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
              Everything you need to actually retain what you study
            </h2>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">
              One workspace that turns your study material into an interactive,
              personal learning system.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <Reveal key={feature.title} delay={i * 100}>
                <div className="group h-full rounded-2xl border border-zinc-200 bg-white p-6 transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-950 dark:text-indigo-300">
                    {feature.icon}
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {feature.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24">
        <div className="mx-auto w-full max-w-6xl px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
              From upload to mastery in three steps
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <Reveal key={step.num} delay={i * 120}>
                <div className="relative rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                  <span className="absolute -top-4 left-6 rounded-full bg-indigo-600 px-3 py-1 text-xs font-bold text-white">
                    {step.num}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {step.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-14 text-center" delay={200}>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500"
            >
              Get started now
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-zinc-50 py-24 dark:bg-zinc-900/40">
        <div className="mx-auto w-full max-w-6xl px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Loved by learners
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
              People actually remember more
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {testimonials.map((item, i) => (
              <Reveal key={item.name} delay={i * 100}>
                <figure className="flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex gap-0.5 text-amber-400">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <svg key={j} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                      {item.name}
                    </p>
                    <p className="text-xs text-zinc-500">{item.role}</p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
