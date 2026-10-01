import { act, render } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MockIntersectionObserver } from '../test/mocks'
import { useSceneStore } from '../store/sceneStore'
import { useActiveSection } from './useActiveSection'

function Page() {
  useActiveSection(['hero', 'about'])
  return (
    <>
      <section id="hero" />
      <section id="about" />
    </>
  )
}

beforeEach(() => {
  useSceneStore.setState(useSceneStore.getInitialState(), true)
})

describe('useActiveSection', () => {
  it('observes every section on a thin band in the middle of the viewport', () => {
    render(<Page />)
    const [observer] = MockIntersectionObserver.instances
    expect(observer.elements.size).toBe(2)
    expect(observer.options.rootMargin).toBe('-45% 0px -50% 0px')
  })

  it('stores the section that crosses the band', () => {
    render(<Page />)
    const [observer] = MockIntersectionObserver.instances
    act(() => observer.trigger([{ isIntersecting: true, target: document.getElementById('about') }]))
    expect(useSceneStore.getState().section).toBe('about')
  })

  it('ignores sections that leave the band', () => {
    render(<Page />)
    const [observer] = MockIntersectionObserver.instances
    act(() => observer.trigger([{ isIntersecting: false, target: document.getElementById('about') }]))
    expect(useSceneStore.getState().section).toBe('hero')
  })
})
