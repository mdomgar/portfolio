import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { mockMatchMedia } from '../test/mocks'
import { useMediaQuery } from './useMediaQuery'

describe('useMediaQuery', () => {
  it('reads the query and follows its changes', () => {
    let narrow = true
    const media = mockMatchMedia((query) => query === '(max-width: 767px)' && narrow)
    const { result } = renderHook(() => useMediaQuery('(max-width: 767px)'))
    expect(result.current).toBe(true)
    narrow = false
    act(() => media.emit(false))
    expect(result.current).toBe(false)
  })
})
