import { act, fireEvent, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HERO_SEEN_KEY, useHeroSequence } from './useHeroSequence'

beforeEach(() => {
  window.sessionStorage.clear()
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

const run = (props) =>
  renderHook((p) => useHeroSequence(p), { initialProps: { running: true, reducedMotion: false, ...props } })

describe('useHeroSequence', () => {
  it('waits for the page to be ready before playing', () => {
    vi.useFakeTimers()
    const { result, rerender } = run({ running: false })
    act(() => vi.advanceTimersByTime(8000))
    expect(result.current.moment).toBe(1)
    rerender({ running: true, reducedMotion: false })
    act(() => vi.advanceTimersByTime(1700))
    expect(result.current.moment).toBe(2)
  })

  it('plays the four moments in about five seconds and remembers it for the session', () => {
    vi.useFakeTimers()
    const { result } = run()
    expect(result.current).toEqual({ moment: 1, instant: false })
    act(() => vi.advanceTimersByTime(1700))
    expect(result.current.moment).toBe(2)
    act(() => vi.advanceTimersByTime(1700))
    expect(result.current.moment).toBe(3)
    act(() => vi.advanceTimersByTime(1700))
    expect(result.current.moment).toBe(4)
    expect(window.sessionStorage.getItem(HERO_SEEN_KEY)).toBe('1')
  })

  it('skips to the end on a key press, without animation', () => {
    const { result } = run()
    fireEvent.keyDown(window, { key: 'Tab' })
    expect(result.current).toEqual({ moment: 4, instant: true })
  })

  it('skips to the end on scroll, wheel, touch or click, keeping the animation', () => {
    for (const fire of [
      () => fireEvent.wheel(window),
      () => fireEvent.scroll(window),
      () => fireEvent.touchStart(window),
      () => fireEvent.pointerDown(window),
    ]) {
      window.sessionStorage.clear()
      const { result, unmount } = run()
      fire()
      expect(result.current).toEqual({ moment: 4, instant: false })
      unmount()
    }
  })

  it('starts at the end with reduced motion or when already seen this session', () => {
    expect(run({ reducedMotion: true }).result.current.moment).toBe(4)
    window.sessionStorage.setItem(HERO_SEEN_KEY, '1')
    expect(run().result.current.moment).toBe(4)
  })

  it('still plays when sessionStorage is blocked', () => {
    vi.useFakeTimers()
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    const { result } = run()
    expect(result.current.moment).toBe(1)
    // One act per moment: each step schedules the next timer after React re-renders.
    for (let step = 0; step < 3; step += 1) act(() => vi.advanceTimersByTime(1700))
    expect(result.current.moment).toBe(4)
  })
})
