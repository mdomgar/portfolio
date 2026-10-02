import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useSceneStore } from '../store/sceneStore'
import { usePageScene } from './usePageScene'

beforeEach(() => {
  useSceneStore.setState(useSceneStore.getInitialState(), true)
})

describe('usePageScene', () => {
  it('tells the scene which page is showing', () => {
    renderHook(() => usePageScene('case'))
    expect(useSceneStore.getState().section).toBe('case')
  })
})
