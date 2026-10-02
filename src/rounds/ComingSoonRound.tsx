import { EMPTY_TALLY } from '../game/tally'
import type { RoundProps } from './types'

/** Placeholder for the fourth round. Completes with 0 points. */
export function ComingSoonRound({ onComplete }: RoundProps) {
  return (
    <section className="card center">
      <h2>Coming soon</h2>
      <p className="muted">This round is still being built.</p>
      <button type="button" className="primary" onClick={() => onComplete(EMPTY_TALLY)} autoFocus>
        Continue
      </button>
    </section>
  )
}
