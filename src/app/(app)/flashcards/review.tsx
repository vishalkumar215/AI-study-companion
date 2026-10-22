'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { reviewFlashcard } from '@/lib/flashcards'

export type ReviewCard = {
  id: string
  question: string
  answer: string
  easeFactor: number
}

export function FlashcardReview({ cards }: { cards: ReviewCard[] }) {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(false)

  if (cards.length === 0) {
    return (
      <p className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        No cards due right now. Nice work!
      </p>
    )
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-lg font-semibold text-zinc-900 dark:text-white">
          Session complete!
        </p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          You reviewed all {cards.length} cards.
        </p>
        <button
          onClick={() => router.refresh()}
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
        >
          Refresh
        </button>
      </div>
    )
  }

  const card = cards[index]

  async function grade(grade: number) {
    await reviewFlashcard(card.id, grade)
    router.refresh()
    if (index + 1 < cards.length) {
      setIndex(index + 1)
      setFlipped(false)
    } else {
      setDone(true)
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between text-sm text-zinc-500">
        <span>
          Card {index + 1} of {cards.length}
        </span>
        <span>ease {card.easeFactor}</span>
      </div>

      <button
        onClick={() => setFlipped(!flipped)}
        className="mt-4 flex min-h-40 w-full flex-col items-center justify-center rounded-xl border border-zinc-300 bg-zinc-100 px-6 py-8 text-center transition hover:border-indigo-600 dark:border-zinc-700 dark:bg-zinc-800"
      >
        {flipped ? (
          <span className="break-words text-lg font-medium leading-relaxed text-zinc-800 dark:text-zinc-100">
            {card.answer}
          </span>
        ) : (
          <span className="break-words text-lg font-medium leading-relaxed text-zinc-800 dark:text-zinc-100">
            {card.question}
          </span>
        )}
        <span className="mt-6 text-xs text-zinc-500">
          {flipped ? 'Tap to show question' : 'Tap to reveal answer'}
        </span>
      </button>

      {flipped && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          <button
            onClick={() => grade(1)}
            className="rounded-xl bg-red-600/80 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-600"
          >
            Again
          </button>
          <button
            onClick={() => grade(4)}
            className="rounded-xl bg-emerald-600/80 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-600"
          >
            Good
          </button>
          <button
            onClick={() => grade(5)}
            className="rounded-xl bg-indigo-600/80 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-600"
          >
            Easy
          </button>
        </div>
      )}
    </div>
  )
}
