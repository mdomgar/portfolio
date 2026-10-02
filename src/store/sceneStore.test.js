import { beforeEach, describe, expect, it } from 'vitest'
import { selectPoseId, useSceneStore } from './sceneStore'

beforeEach(() => {
  useSceneStore.setState(useSceneStore.getInitialState(), true)
})

describe('sceneStore', () => {
  it('starts at the hero with no tier and the lamp on', () => {
    expect(useSceneStore.getState()).toMatchObject({ section: 'hero', sceneCue: null, tier: null, lampOn: true })
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

  it('lets a scene cue override the section pose', () => {
    useSceneStore.getState().setSection('proceso')
    expect(selectPoseId(useSceneStore.getState())).toBe('process')
    useSceneStore.getState().setSceneCue('service-tool')
    expect(selectPoseId(useSceneStore.getState())).toBe('service-tool')
  })

  it('only releases the cue that is still active', () => {
    const { setSceneCue, releaseSceneCue } = useSceneStore.getState()
    setSceneCue('hero-q2')
    releaseSceneCue('hero-q1')
    expect(useSceneStore.getState().sceneCue).toBe('hero-q2')
    releaseSceneCue('hero-q2')
    expect(useSceneStore.getState().sceneCue).toBeNull()
  })
})
