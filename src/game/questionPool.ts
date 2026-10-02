import type { Rng } from '../utils/rng'
import { shuffle } from '../utils/shuffle'

export interface QuestionPool<T> {
  /** Returns the next item. Never repeats until every item has been served. */
  next(): T
}

/**
 * Serves items lazily from a shuffled queue. When the queue runs out it is
 * reshuffled, and the first item of a new cycle is never the last item served.
 */
export function createQuestionPool<T>(items: readonly T[], rng: Rng = Math.random): QuestionPool<T> {
  if (items.length === 0) throw new Error('Question pool needs at least one item')
  let queue: T[] = []
  let last: T | undefined

  return {
    next() {
      if (queue.length === 0) {
        queue = shuffle(items, rng)
        if (last !== undefined && queue.length > 1 && queue[0] === last) {
          const swap = 1 + Math.floor(rng() * (queue.length - 1))
          queue[0] = queue[swap] as T
          queue[swap] = last
        }
      }
      last = queue.shift() as T
      return last
    },
  }
}
