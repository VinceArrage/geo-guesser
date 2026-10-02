interface RoundIntroProps {
  roundNumber: number
  totalRounds: number
  name: string
  description: string
  durationSeconds: number
  onStart: () => void
}

export function RoundIntro({ roundNumber, totalRounds, name, description, durationSeconds, onStart }: RoundIntroProps) {
  return (
    <section className="card center">
      <p className="eyebrow">
        Round {roundNumber} of {totalRounds}
      </p>
      <h2>{name}</h2>
      <p>{description}</p>
      <p className="muted small">{durationSeconds} seconds. Answer as many as you can.</p>
      <button type="button" className="primary" onClick={onStart} autoFocus>
        Start
      </button>
    </section>
  )
}
