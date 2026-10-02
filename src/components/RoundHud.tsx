interface RoundHudProps {
  remainingMs: number
  score: number
}

export const WARNING_MS = 10_000

export function RoundHud({ remainingMs, score }: RoundHudProps) {
  const seconds = Math.ceil(remainingMs / 1000)
  const warning = remainingMs <= WARNING_MS
  return (
    <div className="hud">
      <div className={`hud-timer${warning ? ' hud-timer--warning' : ''}`} role="timer">
        <span className="hud-label">Time</span>
        <span className="hud-value">{seconds}s</span>
      </div>
      <div className="hud-score">
        <span className="hud-label">Score</span>
        <span className="hud-value">{score}</span>
      </div>
    </div>
  )
}
