import { useEffect, useRef, useState } from 'react'
import { scoreCityGuess, type City, type CityGuessResult } from '../game/cities'
import { EMPTY_TALLY, recordAnswer, recordSkip } from '../game/tally'
import type { RoundResult } from '../rounds/types'
import type { LatLng } from '../utils/haversine'

export const REVEAL_MS = 1000

export interface CityReveal extends CityGuessResult {
  guess: LatLng
  city: City
}

/**
 * State for the city round: current city, the reveal shown after a guess,
 * skip, and scoring. Guesses are locked through a ref so a double tap only
 * scores once.
 */
export function useCityRound(nextCity: () => City, revealMs = REVEAL_MS) {
  const [city, setCity] = useState(nextCity)
  const [reveal, setReveal] = useState<CityReveal | null>(null)
  const [tally, setTally] = useState<RoundResult>(EMPTY_TALLY)
  /** Increments for every new question, so the map knows when to reset its view. */
  const [questionId, setQuestionId] = useState(0)
  const tallyRef = useRef<RoundResult>(EMPTY_TALLY)
  const lockedRef = useRef(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current)
    },
    [],
  )

  const updateTally = (next: RoundResult) => {
    tallyRef.current = next
    setTally(next)
  }

  const advance = () => {
    setCity(nextCity())
    setReveal(null)
    setQuestionId((id) => id + 1)
    lockedRef.current = false
  }

  const guess = (point: LatLng) => {
    if (lockedRef.current) return
    lockedRef.current = true
    const result = scoreCityGuess(point, city)
    updateTally(recordAnswer(tallyRef.current, result.points, result.isCorrect))
    setReveal({ ...result, guess: point, city })
    timeoutRef.current = setTimeout(advance, revealMs)
  }

  const skip = () => {
    if (lockedRef.current) return
    updateTally(recordSkip(tallyRef.current))
    advance()
  }

  /** Stops accepting input, e.g. when the round timer expires. */
  const lock = () => {
    lockedRef.current = true
  }

  return { city, reveal, tally, questionId, getResult: () => tallyRef.current, guess, skip, lock }
}
