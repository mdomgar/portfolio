import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useSceneStore } from '../store/sceneStore'
import { useQualityTier } from './useQualityTier'

beforeEach(() => {
  useSceneStore.setState(useSceneStore.getInitialState(), true)
  delete document.documentElement.dataset.scene
})

describe('useQualityTier', () => {
  it('detects the tier on the client and exposes it on <html>', () => {
    const { result } = renderHook(() => useQualityTier())
    // jsdom has no WebGL (getContext → null), so detection lands on the static tier.
    expect(result.current).toBe('static')
    expect(document.documentElement.dataset.scene).toBe('static')
  })

  it('keeps a tier that is already known', () => {
    useSceneStore.getState().setTier('medium')
    renderHook(() => useQualityTier())
    expect(useSceneStore.getState().tier).toBe('medium')
    expect(document.documentElement.dataset.scene).toBe('live')
  })
})
