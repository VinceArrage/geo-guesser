import type { ComponentType } from 'react'

export interface RoundResult {
  score: number
  correct: number
  /** Questions answered (skips excluded). */
  attempts: number
  skipped: number
}

export interface RoundProps {
  durationSeconds: number
  onComplete: (result: RoundResult) => void
}

export interface RoundDefinition {
  id: string
  name: string
  description: string
  durationSeconds: number
  component: ComponentType<RoundProps>
  /** Optional data fetch started when the game loads, so the round can begin instantly. */
  preload?: () => Promise<unknown>
}
