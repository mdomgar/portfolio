import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useSceneStore } from '../store/sceneStore'
import { useSceneCue } from './useSceneCue'

beforeEach(() => {
  useSceneStore.setState(useSceneStore.getInitialState(), true)
})

describe('useSceneCue', () => {
  it('sets the cue, swaps it and releases it on unmount', () => {
    const { rerender, unmount } = renderHook(({ cue }) => useSceneCue(cue), { initialProps: { cue: 'hero-q1' } })
    expect(useSceneStore.getState().sceneCue).toBe('hero-q1')
    rerender({ cue: 'hero-q2' })
    expect(useSceneStore.getState().sceneCue).toBe('hero-q2')
    rerender({ cue: null })
    expect(useSceneStore.getState().sceneCue).toBeNull()
    rerender({ cue: 'service-web' })
    unmount()
    expect(useSceneStore.getState().sceneCue).toBeNull()
  })

  it('never clears a cue that belongs to someone else', () => {
    const { unmount } = renderHook(() => useSceneCue('hero-q1'))
    useSceneStore.getState().setSceneCue('service-app')
    unmount()
    expect(useSceneStore.getState().sceneCue).toBe('service-app')
  })
})
