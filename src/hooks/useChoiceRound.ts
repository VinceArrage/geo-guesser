import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChoiceQuestion } from '../game/choices'
import { choiceScore } from '../game/scoring'
import { EMPTY_TALLY, recordAnswer, recordSkip } from '../game/tally'
import type { RoundResult } from '../rounds/types'

export const FEEDBACK_MS = 500

export interface ChoiceFeedback {
  selectedKey: string
  correctKey: string
  isCorrect: boolean
}

interface QuestionState<T> {
  current: ChoiceQuestion<T>
  upcoming: ChoiceQuestion<T>
}

/**
 * Shared state for multiple-choice rounds: current and upcoming question
 * (so the next one can be preloaded), feedback flash, skip, and scoring.
 * Answers are locked through a ref so a double click can only score once.
 */
export function useChoiceRound<T>(
  makeQuestion: () => ChoiceQuestion<T>,
  key: (item: T) => string,
  feedbackMs = FEEDBACK_MS,
) {
  const [questions, setQuestions] = useState<QuestionState<T>>(() => ({
    current: makeQuestion(),
    upcoming: makeQuestion(),
  }))
  const [feedback, setFeedback] = useState<ChoiceFeedback | null>(null)
  const [tally, setTally] = useState<RoundResult>(EMPTY_TALLY)
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

  const advance = useCallback(() => {
    // Generated outside the updater so StrictMode's double-invoked updaters don't advance the pool twice.
    const next = makeQuestion()
    setQuestions((q) => ({ current: q.upcoming, upcoming: next }))
    setFeedback(null)
    lockedRef.current = false
  }, [makeQuestion])

  const answer = (option: T) => {
    if (lockedRef.current) return
    lockedRef.current = true
    const selectedKey = key(option)
    const correctKey = key(questions.current.answer)
    const isCorrect = selectedKey === correctKey
    updateTally(recordAnswer(tallyRef.current, choiceScore(isCorrect), isCorrect))
    setFeedback({ selectedKey, correctKey, isCorrect })
    timeoutRef.current = setTimeout(advance, feedbackMs)
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

  return {
    question: questions.current,
    upcoming: questions.upcoming,
    feedback,
    tally,
    getResult: () => tallyRef.current,
    answer,
    skip,
    lock,
  }
}
