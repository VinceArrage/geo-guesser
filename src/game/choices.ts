import type { Rng } from '../utils/rng'
import { shuffle } from '../utils/shuffle'
import { createQuestionPool } from './questionPool'

export interface ChoiceQuestion<T> {
  answer: T
  options: T[]
}

export interface ChoiceOptions<T> {
  /** Unique identity for an item. */
  key: (item: T) => string
  /** Groupings tried in order when picking distractors, most similar first (e.g. subregion, region). */
  groups?: ReadonlyArray<(item: T) => string>
  count?: number
  rng?: Rng
}

/**
 * Builds `count` distinct options including the answer. Distractors come from
 * the answer's closest group first, falling back to broader groups and finally
 * the whole pool.
 */
export function buildChoices<T>(answer: T, pool: readonly T[], opts: ChoiceOptions<T>): T[] {
  const { key, groups = [], count = 4, rng = Math.random } = opts
  const picked = new Map<string, T>([[key(answer), answer]])

  const take = (candidates: readonly T[]) => {
    for (const item of shuffle(candidates, rng)) {
      if (picked.size >= count) return
      const k = key(item)
      if (!picked.has(k)) picked.set(k, item)
    }
  }

  for (const group of groups) {
    const g = group(answer)
    take(pool.filter((item) => group(item) === g))
  }
  take(pool)

  if (picked.size < count) throw new Error(`Need at least ${count} distinct items to build choices`)
  return shuffle([...picked.values()], rng)
}

/** Returns a function producing endless multiple-choice questions without repeats. */
export function createChoiceQuestionGenerator<T>(
  items: readonly T[],
  opts: ChoiceOptions<T>,
): () => ChoiceQuestion<T> {
  const pool = createQuestionPool(items, opts.rng)
  return () => {
    const answer = pool.next()
    return { answer, options: buildChoices(answer, items, opts) }
  }
}
