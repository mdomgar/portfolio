import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTypewriterState, useTypewriter } from './useTypewriter'

const timing = { typeMs: 10, deleteMs: 5, holdMs: 100 }

describe('nextTypewriterState', () => {
  it('types, holds, deletes and moves to the next word', () => {
    const words = ['ab', 'c']
    let state = { index: 0, text: '', deleting: false, delay: 10 }
    const seen = []
    for (let i = 0; i < 7; i += 1) {
      state = nextTypewriterState(state, words, timing)
      seen.push(`${state.text}|${state.deleting}|${state.delay}`)
    }
    expect(seen).toEqual(['a|false|10', 'ab|false|10', 'ab|true|100', 'a|true|5', '|true|5', '|false|10', 'c|false|10'])
  })
})

describe('useTypewriter', () => {
  afterEach(() => vi.useRealTimers())

  it('shows the first word, fully typed, when disabled', () => {
    const { result } = renderHook(() => useTypewriter(['Web Developer', 'Full Stack'], { enabled: false }))
    expect(result.current).toBe('Web Developer')
  })

  it('types the first word over time when enabled', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useTypewriter(['Web'], { enabled: true, typeMs: 50 }))
    expect(result.current).toBe('')
    for (let i = 0; i < 3; i += 1) act(() => vi.advanceTimersByTime(50))
    expect(result.current).toBe('Web')
  })
})
