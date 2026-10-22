// SM-2 spaced repetition algorithm (pure function, no server)
// grade: Again=1, Hard=3, Good=4, Easy=5
export function sm2(
  easeFactor: number,
  interval: number,
  repetitions: number,
  grade: number,
) {
  if (grade < 3) {
    return { easeFactor, interval: 0, repetitions: 0 }
  }

  let nextInterval: number
  if (repetitions === 0) nextInterval = 1
  else if (repetitions === 1) nextInterval = 6
  else nextInterval = Math.round(interval * easeFactor)

  const nextEase = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)),
  )

  return {
    easeFactor: nextEase,
    interval: nextInterval,
    repetitions: repetitions + 1,
  }
}
