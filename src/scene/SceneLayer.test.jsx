import { act, render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SceneLayer from './SceneLayer'
import SceneErrorBoundary from './SceneErrorBoundary'
import { useSceneStore } from '../store/sceneStore'

beforeEach(() => {
  useSceneStore.setState(useSceneStore.getInitialState(), true)
})

describe('SceneLayer', () => {
  it('renders nothing until the tier is known', () => {
    const { container } = render(<SceneLayer reducedMotion={false} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows the static fallback instead of WebGL on the static tier', () => {
    act(() => useSceneStore.getState().setTier('static'))
    const { container } = render(<SceneLayer reducedMotion={false} />)
    expect(container.querySelector('.scene-fallback')).toBeInTheDocument()
    expect(container.querySelector('canvas')).not.toBeInTheDocument()
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('dims the scene behind text-heavy sections unless a cue takes over', () => {
    act(() => {
      useSceneStore.getState().setTier('static')
      useSceneStore.getState().setSection('proceso')
    })
    const { container } = render(<SceneLayer reducedMotion={false} />)
    expect(container.firstChild).toHaveAttribute('data-dimmed', 'true')
    act(() => useSceneStore.getState().setSceneCue('service-web'))
    expect(container.firstChild).toHaveAttribute('data-dimmed', 'false')
  })
})

describe('SceneErrorBoundary', () => {
  it('shows the fallback and reports when the scene crashes', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const onError = vi.fn()
    const Broken = () => {
      throw new Error('WebGL context lost')
    }
    const { getByText } = render(
      <SceneErrorBoundary fallback={<p>fallback</p>} onError={onError}>
        <Broken />
      </SceneErrorBoundary>,
    )
    expect(getByText('fallback')).toBeInTheDocument()
    expect(onError).toHaveBeenCalledTimes(1)
    vi.restoreAllMocks()
  })
})
