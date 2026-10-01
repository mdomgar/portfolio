import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { computeProgress, usePreload } from './usePreload'

describe('computeProgress', () => {
  it('never runs ahead of the real work', () => {
    expect(computeProgress({ elapsed: 5000, minDuration: 1000, done: 1, total: 2 })).toBe(50)
  })

  it('never runs ahead of the minimum duration', () => {
    expect(computeProgress({ elapsed: 250, minDuration: 1000, done: 2, total: 2 })).toBe(25)
  })

  it('handles no tasks and no minimum duration', () => {
    expect(computeProgress({ elapsed: 0, minDuration: 0, done: 0, total: 0 })).toBe(100)
  })
})

describe('usePreload', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame', 'performance'] })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('finishes once every task resolves and the minimum time passes', async () => {
    const { result } = renderHook(() => usePreload([() => Promise.resolve()], { minDuration: 500 }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(600)
    })
    expect(result.current).toEqual({ progress: 100, finished: true })
  })

  it('counts failed tasks as done', async () => {
    const { result } = renderHook(() => usePreload([() => Promise.reject(new Error('404'))], { minDuration: 100 }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200)
    })
    expect(result.current.finished).toBe(true)
  })

  it('gives up waiting after the timeout', async () => {
    const never = () => new Promise(() => {})
    const { result } = renderHook(() => usePreload([never], { minDuration: 100, timeout: 1000 }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(900)
    })
    expect(result.current.finished).toBe(false)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200)
    })
    expect(result.current).toEqual({ progress: 100, finished: true })
  })

  it('still finishes at the timeout when requestAnimationFrame never fires', async () => {
    vi.stubGlobal('requestAnimationFrame', () => 0)
    vi.stubGlobal('cancelAnimationFrame', () => {})
    try {
      const never = () => new Promise(() => {})
      const { result } = renderHook(() => usePreload([never], { minDuration: 100, timeout: 1000 }))
      expect(result.current.finished).toBe(false)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1100)
      })
      expect(result.current).toEqual({ progress: 100, finished: true })
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('does not fire the hard stop after unmount', async () => {
    const never = () => new Promise(() => {})
    const { result, unmount } = renderHook(() => usePreload([never], { minDuration: 100, timeout: 1000 }))
    unmount()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500)
    })
    expect(result.current.finished).toBe(false)
  })
})
