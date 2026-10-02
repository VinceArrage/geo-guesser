import type { RoundResult } from '../rounds/types'

interface FinalSummaryProps {
  rounds: ReadonlyArray<{ id: string; name: string; result: RoundResult }>
  onPlayAgain: () => void
}

export function FinalSummary({ rounds, onPlayAgain }: FinalSummaryProps) {
  const total = rounds.reduce((sum, r) => sum + r.result.score, 0)
  return (
    <section className="card center">
      <p className="eyebrow">Game over</p>
      <h2>Total score</h2>
      <p className="big-score">{total}</p>
      <table className="summary">
        <thead>
          <tr>
            <th scope="col">Round</th>
            <th scope="col">Correct</th>
            <th scope="col">Score</th>
          </tr>
        </thead>
        <tbody>
          {rounds.map(({ id, name, result }) => (
            <tr key={id}>
              <td>{name}</td>
              <td>
                {result.correct}/{result.attempts}
              </td>
              <td>{result.score}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" colSpan={2}>
              Total
            </th>
            <td>{total}</td>
          </tr>
        </tfoot>
      </table>
      <button type="button" className="primary" onClick={onPlayAgain} autoFocus>
        Play again
      </button>
    </section>
  )
}
