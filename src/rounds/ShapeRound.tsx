import { useEffect, useState } from 'react'
import { ChoiceGrid } from '../components/ChoiceGrid'
import { RoundHud } from '../components/RoundHud'
import { SHAPE_HEIGHT, SHAPE_WIDTH, getLoadedShapes, loadShapes, shapePath } from '../data/shapeData'
import { createChoiceQuestionGenerator } from '../game/choices'
import { countryChoiceOptions } from '../game/countries'
import type { ShapeCountry } from '../game/shapes'
import { useChoiceRound } from '../hooks/useChoiceRound'
import { useCountdown } from '../hooks/useCountdown'
import type { RoundProps } from './types'

const shapeKey = (s: ShapeCountry) => s.country.cca2
const shapeName = (s: ShapeCountry) => s.country.name

/** Waits for shape data (normally already preloaded) before starting the timer. */
export function ShapeRound(props: RoundProps) {
  const [shapes, setShapes] = useState(getLoadedShapes)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (shapes) return
    let active = true
    loadShapes().then(
      (s) => active && setShapes(s),
      () => active && setError(true),
    )
    return () => {
      active = false
    }
  }, [shapes])

  if (error) return <p className="card center">Could not load country shapes. Check your connection and reload.</p>
  if (!shapes) return <p className="card center muted">Loading shapes…</p>
  return <ShapeRoundPlay {...props} shapes={shapes} />
}

function ShapeRoundPlay({ durationSeconds, onComplete, shapes }: RoundProps & { shapes: ShapeCountry[] }) {
  const [makeQuestion] = useState(() =>
    createChoiceQuestionGenerator(shapes, {
      key: shapeKey,
      groups: countryChoiceOptions.groups?.map((g) => (s: ShapeCountry) => g(s.country)),
    }),
  )
  const round = useChoiceRound(makeQuestion, shapeKey)
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

  // Project the next outline ahead of time so switching questions is instant.
  const { upcoming } = round
  useEffect(() => {
    shapePath(upcoming.answer)
  }, [upcoming])

  const flash = round.feedback ? (round.feedback.isCorrect ? ' flash-correct' : ' flash-wrong') : ''

  return (
    <section className="round">
      <RoundHud remainingMs={remainingMs} score={round.tally.score} />
      <div className={`prompt${flash}`}>
        <svg
          className="shape"
          viewBox={`0 0 ${SHAPE_WIDTH} ${SHAPE_HEIGHT}`}
          role="img"
          aria-label="Country outline to identify"
        >
          <path d={shapePath(round.question.answer)} />
        </svg>
      </div>
      <ChoiceGrid
        options={round.question.options}
        feedback={round.feedback}
        getKey={shapeKey}
        getLabel={shapeName}
        onSelect={round.answer}
      />
      <button type="button" className="skip" onClick={round.skip} disabled={round.feedback !== null}>
        Skip
      </button>
    </section>
  )
}
