import { describe, expect, it } from 'vitest'
import { seededRng } from './rng'
import { shuffle } from './shuffle'

describe('shuffle', () => {
  const items = Array.from({ length: 20 }, (_, i) => i)

  it('returns a permutation without mutating the input', () => {
    const copy = items.slice()
    const result = shuffle(items, seededRng(1))
    expect(items).toEqual(copy)
    expect(result).not.toBe(items)
    expect([...result].sort((a, b) => a - b)).toEqual(items)
  })

  it('is deterministic for a given seed and varies across seeds', () => {
    expect(shuffle(items, seededRng(42))).toEqual(shuffle(items, seededRng(42)))
    expect(shuffle(items, seededRng(1))).not.toEqual(shuffle(items, seededRng(2)))
  })

  it('handles empty and single-item arrays', () => {
    expect(shuffle([], seededRng(1))).toEqual([])
    expect(shuffle(['a'], seededRng(1))).toEqual(['a'])
  })

  it('places every item in every position roughly uniformly', () => {
    const rng = seededRng(7)
    const counts = [0, 0, 0, 0]
    const runs = 4000
    for (let i = 0; i < runs; i++) {
      const first = shuffle([0, 1, 2, 3], rng)[0] as number
      counts[first] = (counts[first] ?? 0) + 1
    }
    for (const c of counts) expect(c / runs).toBeGreaterThan(0.2)
  })
})
