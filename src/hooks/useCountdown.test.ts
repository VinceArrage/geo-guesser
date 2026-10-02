import { act, renderHook } from '@testing-library/react'
import { StrictMode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useCountdown } from './useCountdown'

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not run until started', () => {
    const onExpire = vi.fn()
    const { result } = renderHook(() => useCountdown({ durationMs: 1000, onExpire }))
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(result.current.remainingMs).toBe(1000)
    expect(result.current.isRunning).toBe(false)
    expect(onExpire).not.toHaveBeenCalled()
  })

  it('counts down and expires on time', () => {
    const onExpire = vi.fn()
    const { result } = renderHook(() => useCountdown({ durationMs: 3000, onExpire }))
    act(() => result.current.start())

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current.remainingMs).toBe(2000)
    expect(result.current.isRunning).toBe(true)

    act(() => {
      vi.advanceTimersByTime(1999)
    })
    expect(onExpire).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(onExpire).toHaveBeenCalledTimes(1)
    expect(result.current.remainingMs).toBe(0)
    expect(result.current.isExpired).toBe(true)
  })

  it('calls onExpire exactly once', () => {
    const onExpire = vi.fn()
    const { result } = renderHook(() => useCountdown({ durationMs: 500, onExpire }))
    act(() => result.current.start())
    act(() => {
      vi.advanceTimersByTime(10_000)
    })
    expect(onExpire).toHaveBeenCalledTimes(1)
  })

  it('stays accurate when ticks are delayed (timestamp based)', () => {
    const onExpire = vi.fn()
    const { result } = renderHook(() => useCountdown({ durationMs: 10_000, onExpire, tickMs: 100 }))
    act(() => result.current.start())
    // Simulate a lagging tab: the clock jumps 4s while no timers run.
    act(() => {
      vi.setSystemTime(Date.now() + 4000)
      vi.advanceTimersByTime(100)
    })
    expect(result.current.remainingMs).toBe(5900)
  })

  it('uses the latest onExpire callback', () => {
    const first = vi.fn()
    const second = vi.fn()
    const { result, rerender } = renderHook(({ cb }) => useCountdown({ durationMs: 1000, onExpire: cb }), {
      initialProps: { cb: first },
    })
    act(() => result.current.start())
    rerender({ cb: second })
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
  })

  it('expires once under StrictMode', () => {
    const onExpire = vi.fn()
    const { result } = renderHook(() => useCountdown({ durationMs: 1000, onExpire }), { wrapper: StrictMode })
    act(() => result.current.start())
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(onExpire).toHaveBeenCalledTimes(1)
  })

  it('cleans up on unmount so nothing fires afterwards', () => {
    const onExpire = vi.fn()
    const { result, unmount } = renderHook(() => useCountdown({ durationMs: 1000, onExpire }))
    act(() => result.current.start())
    unmount()
    expect(vi.getTimerCount()).toBe(0)
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(onExpire).not.toHaveBeenCalled()
  })
})
