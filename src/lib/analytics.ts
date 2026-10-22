import 'server-only'

import { db } from '@/lib/db'
import { addDays, computeStreak, dayKey } from '@/lib/streak'

export type DashboardAnalytics = {
  streakDays: number
  reviewsToday: number
  cardsLearned: number
  quizAverage: number
  quizzesTaken: number
  last7Days: Array<{ date: string; reviews: number; quizzes: number }>
}

export async function getDashboardAnalytics(
  userId: string,
): Promise<DashboardAnalytics> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const weekAgo = addDays(today, -6)
  weekAgo.setHours(0, 0, 0, 0)

  const [learnedCards, quizzes, recentReviews, recentQuizzes] =
    await Promise.all([
      // Cards that have reached a mature interval (>= 21 days) — "learned"
      db.flashcard.count({
        where: { userId, interval: { gte: 21 } },
      }),
      db.quiz.findMany({
        where: {
          userId,
          questions: { some: { userAnswerIndex: { not: null } } },
        },
        select: { questions: { select: { answerIndex: true, userAnswerIndex: true } } },
      }),
      db.flashcard.findMany({
        where: { userId, lastReviewedAt: { gte: weekAgo } },
        select: { lastReviewedAt: true },
      }),
      db.quiz.findMany({
        where: { userId, createdAt: { gte: weekAgo } },
        select: { createdAt: true },
      }),
    ])

  const quizzesTaken = quizzes.length
  let totalCorrect = 0
  let totalQuestions = 0
  for (const quiz of quizzes) {
    for (const q of quiz.questions) {
      totalQuestions += 1
      if (q.userAnswerIndex === q.answerIndex) totalCorrect += 1
    }
  }
  const quizAverage =
    totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0

  const reviewsToday = recentReviews.filter(
    (r) => r.lastReviewedAt && r.lastReviewedAt >= today,
  ).length

  // 7-day activity map
  const activity = new Map<string, { reviews: number; quizzes: number }>()
  for (let i = 0; i < 7; i++) {
    const key = dayKey(addDays(today, i - 6))
    activity.set(key, { reviews: 0, quizzes: 0 })
  }

  for (const r of recentReviews) {
    if (r.lastReviewedAt) {
      const key = dayKey(r.lastReviewedAt)
      const entry = activity.get(key)
      if (entry) entry.reviews += 1
    }
  }
  for (const q of recentQuizzes) {
    const key = dayKey(q.createdAt)
    const entry = activity.get(key)
    if (entry) entry.quizzes += 1
  }

  const last7Days = [...activity.entries()].map(([date, counts]) => ({
    date,
    ...counts,
  }))

  return {
    streakDays: computeStreak(activity, today),
    reviewsToday,
    cardsLearned: learnedCards,
    quizAverage,
    quizzesTaken,
    last7Days,
  }
}