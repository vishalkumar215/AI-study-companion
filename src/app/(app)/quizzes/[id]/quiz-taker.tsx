'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { submitQuiz } from '@/lib/quizzes'

export type QuizQuestionData = {
  id: string
  question: string
  options: string[]
  answerIndex: number
  userAnswerIndex: number | null
}

type Result = { total: number; correct: number; percentage: number }

export function QuizTaker({
  quizId,
  questions,
}: {
  quizId: string
  questions: QuizQuestionData[]
}) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<Result | null>(null)

  const alreadyTaken = questions.every(
    (q) => q.userAnswerIndex !== null && q.userAnswerIndex !== undefined,
  )

  const current = questions[index]
  const selected = current ? answers[current.id] : undefined
  const isCorrect =
    revealed && selected !== undefined && selected === current?.answerIndex
  const correctSoFar = questions.filter(
    (q) => answers[q.id] !== undefined && answers[q.id] === q.answerIndex,
  ).length

  async function handleAnswer(optionIndex: number) {
    if (!current || revealed) return
    setAnswers((prev) => ({ ...prev, [current.id]: optionIndex }))
    setRevealed(true)
  }

  async function handleNext() {
    if (index < questions.length - 1) {
      setIndex((i) => i + 1)
      setRevealed(false)
      return
    }
    setSubmitting(true)
    const res = await submitQuiz(quizId, answers)
    setSubmitting(false)
    if (res) {
      setResult(res)
      router.refresh()
    }
  }

  if (alreadyTaken || result) {
    const correct = result
      ? result.correct
      : questions.filter((q) => q.userAnswerIndex === q.answerIndex).length
    const total = result ? result.total : questions.length
    const percentage = result
      ? result.percentage
      : Math.round((correct / total) * 100)

    return (
      <div className="space-y-6">
        <div
          className={`rounded-2xl border p-6 text-center ${
            percentage >= 60
              ? 'border-emerald-300 dark:border-emerald-800'
              : 'border-amber-300 dark:border-amber-800'
          } ${percentage >= 60 ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}
        >
          <p className="text-4xl font-bold text-zinc-900 dark:text-white">{percentage}%</p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-300">
            {correct} of {total} correct
          </p>
        </div>

        <div className="space-y-4">
          {questions.map((q, qi) => {
            const picked = answers[q.id] ?? q.userAnswerIndex
            return (
              <div
                key={q.id}
                className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <p className="font-medium break-words text-zinc-900 dark:text-white">
                  {qi + 1}. {q.question}
                </p>
                <ul className="mt-3 space-y-2">
                  {q.options.map((opt, oi) => (
                    <li
                      key={oi}
                      className={`break-words rounded-lg px-3 py-2 text-sm ${
                        oi === q.answerIndex
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          : oi === picked
                            ? 'bg-red-500/15 text-red-700 dark:text-red-300'
                            : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}
                    >
                      {opt}
                      {oi === q.answerIndex && ' (correct)'}
                      {oi === picked && oi !== q.answerIndex && ' (your pick)'}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (!current) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
        <p>
          Question {index + 1} of {questions.length}
        </p>
        <p>{correctSoFar} correct</p>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all"
          style={{
            width: `${((index + (revealed ? 1 : 0)) / questions.length) * 100}%`,
          }}
        />
      </div>

      <div className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="font-medium break-words text-zinc-900 dark:text-white">
          {current.question}
        </p>
        <div className="mt-3 space-y-2">
          {current.options.map((opt, oi) => {
            const isSelected = oi === selected
            const cls = revealed
              ? oi === current.answerIndex
                ? 'bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500 dark:text-emerald-300'
                : isSelected
                  ? 'bg-red-500/15 text-red-700 ring-1 ring-red-500 dark:text-red-300'
                  : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
              : isSelected
                ? 'bg-indigo-500/15 text-indigo-700 ring-1 ring-indigo-500 dark:text-indigo-300'
                : 'bg-zinc-100 text-zinc-700 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700'

            return (
              <button
                key={oi}
                type="button"
                data-option={oi}
                disabled={revealed}
                onClick={() => handleAnswer(oi)}
                className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium break-words ${cls}`}
              >
                {opt}
                {revealed && oi === current.answerIndex && ' ✓'}
                {revealed && isSelected && oi !== current.answerIndex && ' ✗'}
              </button>
            )
          })}
        </div>

        {revealed && (
          <div
            className={`mt-4 break-words rounded-lg px-3 py-2.5 text-sm ${
              isCorrect
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                : 'bg-red-500/10 text-red-700 dark:text-red-300'
            }`}
          >
            {isCorrect
              ? 'Correct!'
              : `Not quite — the answer is "${current.options[current.answerIndex]}".`}
          </div>
        )}
      </div>

      {revealed && (
        <button
          type="button"
          onClick={handleNext}
          disabled={submitting}
          className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
        >
          {index === questions.length - 1
            ? submitting
              ? 'Saving…'
              : 'See results'
            : 'Next question →'}
        </button>
      )}
    </div>
  )
}
