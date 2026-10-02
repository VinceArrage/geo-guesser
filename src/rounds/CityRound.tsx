import { useEffect, useState } from 'react'
import { CityMap } from '../components/CityMap'
import { RoundHud } from '../components/RoundHud'
import { CITIES } from '../game/cities'
import { createQuestionPool } from '../game/questionPool'
import { useCityRound } from '../hooks/useCityRound'
import { useCountdown } from '../hooks/useCountdown'
import type { RoundProps } from './types'

const formatKm = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 })

export function CityRound({ durationSeconds, onComplete }: RoundProps) {
  const [nextCity] = useState(() => {
    const pool = createQuestionPool(CITIES)
    return () => pool.next()
  })
  const round = useCityRound(nextCity)
  const { remainingMs, start } = useCountdown({
    durationMs: durationSeconds * 1000,
    onExpire: () => {
      round.lock()
      onComplete(round.getResult())
    },
  })

  useEffect(() => {
    start()
  }, [start])

  const { reveal } = round

  return (
    <section className="round">
      <RoundHud remainingMs={remainingMs} score={round.tally.score} />
      <div className="city-prompt">
        <p className="city-name">
          {round.city.name}, <span className="muted">{round.city.country}</span>
        </p>
        <p className="city-result" aria-live="polite">
          {reveal
            ? `${formatKm.format(reveal.distanceKm)} km away · +${reveal.points}`
            : 'Tap the map where this city is'}
        </p>
      </div>
      <CityMap reveal={reveal} questionId={round.questionId} onGuess={round.guess} />
      <button type="button" className="skip" onClick={round.skip} disabled={reveal !== null}>
        Skip
      </button>
    </section>
  )
}
