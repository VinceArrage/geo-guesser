import { describe, expect, it } from 'vitest'
import { choiceScore, cityScore } from './scoring'
import { EMPTY_TALLY, recordAnswer, recordSkip } from './tally'

describe('choiceScore', () => {
  it('awards 100 for a correct answer and 0 otherwise', () => {
    expect(choiceScore(true)).toBe(100)
    expect(choiceScore(false)).toBe(0)
  })
})

describe('cityScore', () => {
  it('awards 1000 at 0 km', () => {
    expect(cityScore(0)).toBe(1000)
  })

  it('scales linearly', () => {
    expect(cityScore(500)).toBe(750)
    expect(cityScore(1000)).toBe(500)
    expect(cityScore(1990)).toBe(5)
  })

  it('awards 0 at 2000 km or more', () => {
    expect(cityScore(2000)).toBe(0)
    expect(cityScore(15000)).toBe(0)
  })

  it('guards against invalid distances', () => {
    expect(cityScore(-5)).toBe(1000)
    expect(cityScore(Number.NaN)).toBe(0)
  })
})

describe('tally', () => {
  it('counts answers and skips separately', () => {
    let t = recordAnswer(EMPTY_TALLY, 100, true)
    t = recordAnswer(t, 0, false)
    t = recordSkip(t)
    expect(t).toEqual({ score: 100, correct: 1, attempts: 2, skipped: 1 })
  })
})
