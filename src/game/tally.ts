import type { RoundResult } from '../rounds/types'

export const EMPTY_TALLY: RoundResult = { score: 0, correct: 0, attempts: 0, skipped: 0 }

/** Adds one answered question to a round tally. */
export function recordAnswer(tally: RoundResult, points: number, isCorrect: boolean): RoundResult {
  return {
    ...tally,
    score: tally.score + points,
    correct: tally.correct + (isCorrect ? 1 : 0),
    attempts: tally.attempts + 1,
  }
}

/** Adds one skipped question to a round tally. Skips are not attempts. */
export function recordSkip(tally: RoundResult): RoundResult {
  return { ...tally, skipped: tally.skipped + 1 }
}
