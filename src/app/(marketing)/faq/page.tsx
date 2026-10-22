import Link from 'next/link'
import { Reveal } from '@/components/reveal'

const faqs = [
  {
    question: 'What is StudyMate AI?',
    answer:
      'StudyMate AI is an AI learning companion. You upload your study material and it builds a personal study toolkit: chat over your documents, auto-generated flashcards with spaced repetition, and practice quizzes — all grounded in your own notes.',
  },
  {
    question: 'What file formats can I upload?',
    answer:
      'You can upload PDF, Markdown, and plain text files up to 10 MB each. After uploading, the text is extracted, chunked, and indexed automatically so it can power chat, flashcards, and quizzes.',
  },
  {
    question: 'How does the AI answer questions about my documents?',
    answer:
      'Using retrieval-augmented generation (RAG). When you ask a question, the app embeds it and searches for the most relevant passages in your uploaded documents. The AI then answers using only those passages as context — so answers stay faithful to your material.',
  },
  {
    question: 'How do the flashcards work?',
    answer:
      'Flashcards are generated from the key topics found in your document. Each card follows the SM-2 spaced-repetition algorithm: you rate a card Again, Good, or Easy, and the app schedules the next review right around the time you are likely to forget it.',
  },
  {
    question: 'How are quizzes generated?',
    answer:
      'Before generating a quiz, the app analyzes your document and extracts 3–8 core topics. It then builds multiple-choice questions that cover all of those topics, so the quiz reflects the whole document rather than a random slice.',
  },
  {
    question: 'Is my data private?',
    answer:
      'Yes. Every document you upload is scoped to your account and only you can see it. Your material is used to power your own study tools and nothing else.',
  },
  {
    question: 'How much does it cost?',
    answer:
      'You can create an account and start learning for free. StudyMate uses a free-tier AI provider, so there is no credit card and no hidden cost to get going.',
  },
  {
    question: 'What if I forget my password?',
    answer:
      'Head to the forgot-password page, enter your account email, and we will send a 6-digit code to your inbox. Enter the code with your new password and you are back in. Codes expire after 15 minutes.',
  },
  {
    question: 'Can I use StudyMate on my phone?',
    answer:
      'Yes. StudyMate works in any modern browser, so you can review flashcards and take quizzes on your phone, tablet, or laptop.',
  },
]

export default function FaqPage() {
  return (
    <div className="overflow-hidden">
      <section className="relative py-20 lg:py-28">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-400/20 blur-3xl animate-blob dark:bg-indigo-600/15" />
        </div>

        <div className="mx-auto w-full max-w-3xl px-6 text-center">
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
            FAQ
          </div>
          <h1
            className="animate-fade-up mt-5 text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl"
            style={{ animationDelay: '100ms' }}
          >
            Frequently asked questions
          </h1>
          <p
            className="animate-fade-up mx-auto mt-4 max-w-xl text-lg text-zinc-600 dark:text-zinc-400"
            style={{ animationDelay: '200ms' }}
          >
            Everything you might want to know about StudyMate AI. Still
            curious?{' '}
            <Link
              href="/contact"
              className="text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Ask us anything
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto w-full max-w-3xl px-6">
          <div className="space-y-3">
            {faqs.map((item, i) => (
              <Reveal key={item.question} delay={i * 40}>
                <details className="group rounded-2xl border border-zinc-200 bg-white transition hover:border-indigo-300 open:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700 dark:open:border-indigo-700">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-left font-semibold text-zinc-900 dark:text-white">
                    {item.question}
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-300 text-zinc-500 transition group-open:rotate-45 group-open:border-indigo-500 group-open:text-indigo-600 dark:border-zinc-700 dark:text-zinc-400">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </span>
                  </summary>
                  <p className="px-6 pb-5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {item.answer}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-12 text-center" delay={100}>
            <p className="text-zinc-600 dark:text-zinc-400">
              Have a question we didn&apos;t cover?
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-block rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              Contact support
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
