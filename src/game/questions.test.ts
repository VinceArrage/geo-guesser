import { describe, expect, it } from 'vitest'
import { seededRng } from '../utils/rng'
import { buildChoices, createChoiceQuestionGenerator } from './choices'
import { COUNTRIES, countryChoiceOptions } from './countries'
import { createQuestionPool } from './questionPool'

describe('createQuestionPool', () => {
  const items = ['a', 'b', 'c', 'd', 'e', 'f']

  it('serves every item once before repeating', () => {
    const pool = createQuestionPool(items, seededRng(3))
    const firstCycle = items.map(() => pool.next())
    expect(new Set(firstCycle).size).toBe(items.length)
  })

  it('reshuffles and continues after the pool is exhausted', () => {
    const pool = createQuestionPool(items, seededRng(5))
    const cycles = Array.from({ length: 5 }, () => items.map(() => pool.next()))
    for (const cycle of cycles) expect([...cycle].sort()).toEqual(items)
    // Reshuffled, not replayed in the same order every time.
    expect(new Set(cycles.map((c) => c.join(''))).size).toBeGreaterThan(1)
  })

  it('never repeats an item back-to-back across a reshuffle', () => {
    for (let seed = 0; seed < 50; seed++) {
      const pool = createQuestionPool(['x', 'y', 'z'], seededRng(seed))
      let prev = pool.next()
      for (let i = 0; i < 30; i++) {
        const next = pool.next()
        expect(next).not.toBe(prev)
        prev = next
      }
    }
  })

  it('works with a single item and rejects an empty pool', () => {
    const pool = createQuestionPool(['only'])
    expect([pool.next(), pool.next()]).toEqual(['only', 'only'])
    expect(() => createQuestionPool([])).toThrow()
  })
})

describe('buildChoices', () => {
  it('always contains the answer and 4 unique options', () => {
    const rng = seededRng(11)
    for (const answer of COUNTRIES) {
      const options = buildChoices(answer, COUNTRIES, { ...countryChoiceOptions, rng })
      expect(options).toHaveLength(4)
      expect(options).toContain(answer)
      expect(new Set(options.map((o) => o.cca2)).size).toBe(4)
    }
  })

  it('prefers distractors from the same subregion, then region', () => {
    const rng = seededRng(2)
    const france = COUNTRIES.find((c) => c.cca2 === 'FR')
    if (!france) throw new Error('France missing from data')
    const options = buildChoices(france, COUNTRIES, { ...countryChoiceOptions, rng })
    for (const o of options) expect(o.region).toBe('Europe')
  })

  it('falls back to the whole pool when a group is too small', () => {
    const items = [
      { id: 'a', group: 'solo' },
      { id: 'b', group: 'other' },
      { id: 'c', group: 'other' },
      { id: 'd', group: 'other' },
    ]
    const options = buildChoices(items[0] as (typeof items)[number], items, {
      key: (i) => i.id,
      groups: [(i) => i.group],
      rng: seededRng(1),
    })
    expect(options.map((o) => o.id).sort()).toEqual(['a', 'b', 'c', 'd'])
  })

  it('throws when there are not enough distinct items', () => {
    expect(() => buildChoices('a', ['a', 'b', 'b'], { key: (s) => s })).toThrow()
  })
})

describe('createChoiceQuestionGenerator', () => {
  it('does not repeat answers until the pool is exhausted, then continues', () => {
    const items = COUNTRIES.slice(0, 12)
    const next = createChoiceQuestionGenerator(items, { ...countryChoiceOptions, rng: seededRng(9) })
    const firstCycle = items.map(() => next())
    expect(new Set(firstCycle.map((q) => q.answer.cca2)).size).toBe(items.length)
    for (const q of firstCycle) expect(q.options).toContain(q.answer)

    const secondCycle = items.map(() => next().answer.cca2)
    expect(new Set(secondCycle).size).toBe(items.length)
  })
})
