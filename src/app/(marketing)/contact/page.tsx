'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { Reveal } from '@/components/reveal'

const channels = [
  {
    title: 'Email us',
    value: 'support@studymate.ai',
    desc: 'For questions about your account, billing, or features.',
  },
  {
    title: 'Response time',
    value: 'Within 24 hours',
    desc: 'We reply to every message — usually much faster.',
  },
  {
    title: 'Feature requests',
    value: 'We read every one',
    desc: 'Tell us what would make studying easier for you.',
  },
]

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    // No backend yet — simulate a short send so the form feels real.
    await new Promise((resolve) => setTimeout(resolve, 600))
    setStatus('sent')
  }

  const inputClass =
    'mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500'

  return (
    <div className="overflow-hidden">
      <section className="relative py-20 lg:py-28">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-violet-400/20 blur-3xl animate-blob dark:bg-violet-600/15" />
          <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl animate-blob dark:bg-indigo-600/15" style={{ animationDelay: '3s' }} />
        </div>

        <div className="mx-auto w-full max-w-3xl px-6 text-center">
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
            Contact
          </div>
          <h1
            className="animate-fade-up mt-5 text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl"
            style={{ animationDelay: '100ms' }}
          >
            We&apos;d love to hear from you
          </h1>
          <p
            className="animate-fade-up mx-auto mt-4 max-w-xl text-lg text-zinc-600 dark:text-zinc-400"
            style={{ animationDelay: '200ms' }}
          >
            Questions, feedback, or just want to say hi? Drop us a message and
            we&apos;ll get back to you.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            {channels.map((channel, i) => (
              <Reveal key={channel.title} delay={i * 100}>
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                    {channel.title}
                  </p>
                  <p className="mt-1 font-bold text-indigo-600 dark:text-indigo-400">
                    {channel.value}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {channel.desc}
                  </p>
                </div>
              </Reveal>
            ))}

            <Reveal delay={300}>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
                Before messaging, you might find an answer in our{' '}
                <Link
                  href="/faq"
                  className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  FAQ
                </Link>
                .
              </div>
            </Reveal>
          </div>

          <Reveal className="lg:col-span-3" delay={150}>
            <div className="rounded-3xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
              {status === 'sent' ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <h2 className="mt-6 text-2xl font-bold text-zinc-900 dark:text-white">
                    Message sent!
                  </h2>
                  <p className="mt-2 max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
                    Thanks for reaching out. Our team will get back to you
                    within 24 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="mt-6 rounded-xl border border-zinc-300 px-6 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                      >
                        Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        placeholder="Ada Lovelace"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                      >
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                    >
                      Subject
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      placeholder="What is this about?"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      placeholder="Tell us what's on your mind…"
                      className={`${inputClass} resize-y`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
                  >
                    {status === 'sending' ? 'Sending…' : 'Send message'}
                  </button>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
