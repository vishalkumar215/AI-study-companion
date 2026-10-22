export function dayKey(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDays(d: Date, days: number): Date {
  const copy = new Date(d)
  copy.setDate(copy.getDate() + days)
  return copy
}

export type DayActivity = { reviews: number; quizzes: number }

export function computeStreak(
  activity: Map<string, DayActivity>,
  today: Date,
): number {
  let streakDays = 0
  let cursor = today
  let skipToday = false
  for (let i = 0; i < 365; i++) {
    const counts = activity.get(dayKey(cursor))
    const hasActivity =
      counts !== undefined && (counts.reviews > 0 || counts.quizzes > 0)

    if (hasActivity) {
      streakDays += 1
    } else if (i === 0 && !skipToday) {
      skipToday = true
    } else {
      break
    }
    cursor = addDays(cursor, -1)
  }
  return streakDays
}
