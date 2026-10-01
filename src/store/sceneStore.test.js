import { beforeEach, describe, expect, it } from 'vitest'
import { useSceneStore } from './sceneStore'

beforeEach(() => {
  useSceneStore.setState(useSceneStore.getInitialState(), true)
})

describe('sceneStore', () => {
  it('starts at the hero with no tier and the lamp on', () => {
    expect(useSceneStore.getState()).toMatchObject({ section: 'hero', tier: null, lampOn: true })
  })

  it('downgrades one quality step at a time and never below low', () => {
    const { setTier, downgrade } = useSceneStore.getState()
    setTier('high')
    downgrade()
    expect(useSceneStore.getState().tier).toBe('medium')
    downgrade()
    expect(useSceneStore.getState().tier).toBe('low')
    downgrade()
    expect(useSceneStore.getState().tier).toBe('low')
  })

  it('ignores downgrade while the tier is unknown or static', () => {
    useSceneStore.getState().downgrade()
    expect(useSceneStore.getState().tier).toBe(null)
    useSceneStore.getState().setTier('static')
    useSceneStore.getState().downgrade()
    expect(useSceneStore.getState().tier).toBe('static')
  })

  it('toggles the desk lamp', () => {
    useSceneStore.getState().toggleLamp()
    expect(useSceneStore.getState().lampOn).toBe(false)
  })
})
