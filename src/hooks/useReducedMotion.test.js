import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { mockMatchMedia } from '../test/mocks'
import { useReducedMotion } from './useReducedMotion'

describe('useReducedMotion', () => {
  it('reads the current preference', () => {
    mockMatchMedia((query) => query === '(prefers-reduced-motion: reduce)')
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(true)
  })

  it('reacts when the preference changes', () => {
    let reduce = false
    const media = mockMatchMedia(() => reduce)
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(false)
    reduce = true
    act(() => media.emit(true))
    expect(result.current).toBe(true)
  })
})
