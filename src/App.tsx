import { Suspense, useEffect, useState, type ReactNode } from 'react'
import { FinalSummary } from './components/FinalSummary'
import { RoundIntro } from './components/RoundIntro'
import { RoundResultView } from './components/RoundResultView'
import { EMPTY_TALLY } from './game/tally'
import { ROUNDS } from './rounds/roundDefinitions'
import type { RoundResult } from './rounds/types'

type Phase =
  | { kind: 'intro'; index: number }
  | { kind: 'playing'; index: number }
  | { kind: 'result'; index: number }
  | { kind: 'summary' }

export default function App() {
  const [phase, setPhase] = useState<Phase>({ kind: 'intro', index: 0 })
  const [results, setResults] = useState<RoundResult[]>([])
  const [gameId, setGameId] = useState(0)

  useEffect(() => {
    for (const round of ROUNDS) {
      round.preload?.().catch(() => {
        // The round shows its own error and retries when it starts.
      })
    }
  }, [])

  const restart = () => {
    setResults([])
    setGameId((id) => id + 1)
    setPhase({ kind: 'intro', index: 0 })
  }

  let content: ReactNode
  if (phase.kind === 'summary') {
    content = (
      <FinalSummary
        rounds={ROUNDS.map((r, i) => ({ id: r.id, name: r.name, result: results[i] ?? EMPTY_TALLY }))}
        onPlayAgain={restart}
      />
    )
  } else {
    const { index } = phase
    const round = ROUNDS[index]
    if (!round) throw new Error(`No round at index ${index}`)

    if (phase.kind === 'intro') {
      content = (
        <RoundIntro
          roundNumber={index + 1}
          totalRounds={ROUNDS.length}
          name={round.name}
          description={round.description}
          durationSeconds={round.durationSeconds}
          onStart={() => setPhase({ kind: 'playing', index })}
        />
      )
    } else if (phase.kind === 'playing') {
      const Round = round.component
      // Lazily loaded rounds mount (and start their timer) only once their code has arrived.
      content = (
        <Suspense fallback={<p className="card center muted">Loading…</p>}>
          <Round
            key={`${gameId}-${round.id}`}
            durationSeconds={round.durationSeconds}
            onComplete={(result) => {
              setResults((prev) => {
                const next = prev.slice()
                next[index] = result
                return next
              })
              setPhase({ kind: 'result', index })
            }}
          />
        </Suspense>
      )
    } else {
      const isLast = index === ROUNDS.length - 1
      content = (
        <RoundResultView
          name={round.name}
          result={results[index] ?? EMPTY_TALLY}
          isLast={isLast}
          onContinue={() => setPhase(isLast ? { kind: 'summary' } : { kind: 'intro', index: index + 1 })}
        />
      )
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>GeoGuessr</h1>
      </header>
      <main className="app-main">{content}</main>
    </div>
  )
}
