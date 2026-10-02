import type { RoundResult } from '../rounds/types'

interface RoundResultViewProps {
  name: string
  result: RoundResult
  isLast: boolean
  onContinue: () => void
}

export function RoundResultView({ name, result, isLast, onContinue }: RoundResultViewProps) {
  return (
    <section className="card center">
      <p className="eyebrow">Round over</p>
      <h2>{name}</h2>
      <p className="big-score">{result.score}</p>
      <dl className="stats">
        <div>
          <dt>Correct</dt>
          <dd>{result.correct}</dd>
        </div>
        <div>
          <dt>Attempts</dt>
          <dd>{result.attempts}</dd>
        </div>
        <div>
          <dt>Skipped</dt>
          <dd>{result.skipped}</dd>
        </div>
      </dl>
      <button type="button" className="primary" onClick={onContinue} autoFocus>
        {isLast ? 'See final score' : 'Next round'}
      </button>
    </section>
  )
}
