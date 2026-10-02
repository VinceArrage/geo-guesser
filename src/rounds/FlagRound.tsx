import { useEffect, useState } from 'react'
import { ChoiceGrid } from '../components/ChoiceGrid'
import { RoundHud } from '../components/RoundHud'
import { flagUrl, preloadImage } from '../data/flags'
import { createChoiceQuestionGenerator } from '../game/choices'
import { COUNTRIES, countryChoiceOptions, type Country } from '../game/countries'
import { useChoiceRound } from '../hooks/useChoiceRound'
import { useCountdown } from '../hooks/useCountdown'
import type { RoundProps } from './types'

const FLAG_COUNTRIES = COUNTRIES.filter((c) => flagUrl(c.cca2) !== undefined)
const countryKey = (c: Country) => c.cca2
const countryName = (c: Country) => c.name

export function FlagRound({ durationSeconds, onComplete }: RoundProps) {
  const [makeQuestion] = useState(() => createChoiceQuestionGenerator(FLAG_COUNTRIES, countryChoiceOptions))
  const round = useChoiceRound(makeQuestion, countryKey)
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

  const upcomingUrl = flagUrl(round.upcoming.answer.cca2)
  useEffect(() => {
    if (upcomingUrl) preloadImage(upcomingUrl)
  }, [upcomingUrl])

  const flash = round.feedback ? (round.feedback.isCorrect ? ' flash-correct' : ' flash-wrong') : ''

  return (
    <section className="round">
      <RoundHud remainingMs={remainingMs} score={round.tally.score} />
      <div className={`prompt${flash}`}>
        <img
          key={round.question.answer.cca2}
          className="flag"
          src={flagUrl(round.question.answer.cca2)}
          alt="Flag to identify"
          draggable={false}
        />
      </div>
      <ChoiceGrid
        options={round.question.options}
        feedback={round.feedback}
        getKey={countryKey}
        getLabel={countryName}
        onSelect={round.answer}
      />
      <button type="button" className="skip" onClick={round.skip} disabled={round.feedback !== null}>
        Skip
      </button>
    </section>
  )
}
