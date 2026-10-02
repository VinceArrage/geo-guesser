import { act, renderHook } from '@testing-library/react'
import { StrictMode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { City } from '../game/cities'
import { createQuestionPool } from '../game/questionPool'
import { seededRng } from '../utils/rng'
import { REVEAL_MS, useCityRound } from './useCityRound'

const CITIES: City[] = [
  { name: 'Paris', country: 'France', lat: 48.86, lng: 2.35 },
  { name: 'Tokyo', country: 'Japan', lat: 35.68, lng: 139.69 },
  { name: 'Lima', country: 'Peru', lat: -12.05, lng: -77.04 },
]

function setup() {
  const pool = createQuestionPool(CITIES, seededRng(1))
  const next = () => pool.next()
  return renderHook(() => useCityRound(next), { wrapper: StrictMode })
}

describe('useCityRound', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('scores a double tap only once and reveals the answer', () => {
    const { result } = setup()
    const city = result.current.city
    act(() => {
      result.current.guess({ lat: city.lat, lng: city.lng })
      result.current.guess({ lat: city.lat, lng: city.lng })
    })
    expect(result.current.getResult()).toEqual({ score: 1000, correct: 1, attempts: 1, skipped: 0 })
    expect(result.current.reveal?.city).toBe(city)
    expect(result.current.reveal?.points).toBe(1000)
  })

  it('moves to a new city after the reveal', () => {
    const { result } = setup()
    const first = result.current.city
    const firstId = result.current.questionId
    act(() => result.current.guess({ lat: 0, lng: 0 }))
    act(() => {
      vi.advanceTimersByTime(REVEAL_MS - 1)
    })
    expect(result.current.reveal).not.toBeNull()
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current.reveal).toBeNull()
    expect(result.current.city).not.toBe(first)
    expect(result.current.questionId).toBe(firstId + 1)
  })

  it('skips without counting an attempt', () => {
    const { result } = setup()
    const first = result.current.city
    act(() => result.current.skip())
    expect(result.current.city).not.toBe(first)
    expect(result.current.tally).toEqual({ score: 0, correct: 0, attempts: 0, skipped: 1 })
  })

  it('ignores input once locked and clears its timer on unmount', () => {
    const { result, unmount } = setup()
    act(() => {
      result.current.lock()
      result.current.guess({ lat: 0, lng: 0 })
      result.current.skip()
    })
    expect(result.current.getResult()).toEqual({ score: 0, correct: 0, attempts: 0, skipped: 0 })
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
