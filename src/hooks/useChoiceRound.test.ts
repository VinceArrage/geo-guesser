import { act, renderHook } from '@testing-library/react'
import { StrictMode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createChoiceQuestionGenerator } from '../game/choices'
import { seededRng } from '../utils/rng'
import { FEEDBACK_MS, useChoiceRound } from './useChoiceRound'

const ITEMS = ['a', 'b', 'c', 'd', 'e', 'f']
const key = (s: string) => s

// StrictMode double-invokes effects on mount, as in the real app.
function setup() {
  const makeQuestion = createChoiceQuestionGenerator(ITEMS, { key, rng: seededRng(4) })
  return renderHook(() => useChoiceRound(makeQuestion, key), { wrapper: StrictMode })
}

describe('useChoiceRound', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('scores a double click only once', () => {
    const { result } = setup()
    const answer = result.current.question.answer
    act(() => {
      result.current.answer(answer)
      result.current.answer(answer)
    })
    expect(result.current.getResult()).toEqual({ score: 100, correct: 1, attempts: 1, skipped: 0 })
  })

  it('shows feedback, then advances to the upcoming question', () => {
    const { result } = setup()
    const upcoming = result.current.upcoming
    const wrong = result.current.question.options.find((o) => o !== result.current.question.answer) as string
    act(() => result.current.answer(wrong))
    expect(result.current.feedback?.isCorrect).toBe(false)
    act(() => {
      vi.advanceTimersByTime(FEEDBACK_MS)
    })
    expect(result.current.feedback).toBeNull()
    expect(result.current.question).toBe(upcoming)
    expect(result.current.tally).toEqual({ score: 0, correct: 0, attempts: 1, skipped: 0 })
  })

  it('skips without counting an attempt', () => {
    const { result } = setup()
    const upcoming = result.current.upcoming
    act(() => result.current.skip())
    expect(result.current.question).toBe(upcoming)
    expect(result.current.tally).toEqual({ score: 0, correct: 0, attempts: 0, skipped: 1 })
  })

  it('ignores input once locked', () => {
    const { result } = setup()
    act(() => {
      result.current.lock()
      result.current.answer(result.current.question.answer)
      result.current.skip()
    })
    expect(result.current.getResult()).toEqual({ score: 0, correct: 0, attempts: 0, skipped: 0 })
  })

  it('clears the feedback timer on unmount', () => {
    const { result, unmount } = setup()
    act(() => result.current.answer(result.current.question.answer))
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
