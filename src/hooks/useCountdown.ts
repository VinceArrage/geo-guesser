import { useCallback, useEffect, useRef, useState } from 'react'

export interface CountdownOptions {
  durationMs: number
  onExpire?: () => void
  /** How often the displayed time refreshes. Accuracy does not depend on this. */
  tickMs?: number
}

export interface Countdown {
  remainingMs: number
  isRunning: boolean
  isExpired: boolean
  /** Starts (or restarts) the countdown from the full duration. */
  start: () => void
}

/**
 * Countdown driven by an end timestamp rather than by counting ticks, so it
 * stays accurate when the tab is throttled. onExpire fires exactly once per
 * start, and all timers are cleared on unmount.
 */
export function useCountdown({ durationMs, onExpire, tickMs = 100 }: CountdownOptions): Countdown {
  const [endAt, setEndAt] = useState<number | null>(null)
  const [remainingMs, setRemainingMs] = useState(durationMs)
  const onExpireRef = useRef(onExpire)

  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  useEffect(() => {
    if (endAt === null) return
    let finished = false

    const tick = () => {
      if (finished) return
      const left = Math.max(0, endAt - Date.now())
      setRemainingMs(left)
      if (left === 0) {
        finished = true
        cleanup()
        onExpireRef.current?.()
      }
    }

    const interval = setInterval(tick, tickMs)
    // A dedicated timeout lands exactly on the deadline instead of up to one tick late.
    const timeout = setTimeout(tick, Math.max(0, endAt - Date.now()))
    document.addEventListener('visibilitychange', tick)

    function cleanup() {
      clearInterval(interval)
      clearTimeout(timeout)
      document.removeEventListener('visibilitychange', tick)
    }

    return () => {
      finished = true
      cleanup()
    }
  }, [endAt, tickMs])

  const start = useCallback(() => {
    setRemainingMs(durationMs)
    setEndAt(Date.now() + durationMs)
  }, [durationMs])

  return {
    remainingMs,
    isRunning: endAt !== null && remainingMs > 0,
    isExpired: endAt !== null && remainingMs === 0,
    start,
  }
}
