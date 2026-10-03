import { act, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import Services from './Services'
import { mockMatchMedia, MockIntersectionObserver } from '../test/mocks'
import { renderWithRouter } from '../test/router'
import { useSceneStore } from '../store/sceneStore'

const section = () => document.getElementById('servicios')

beforeEach(() => {
  useSceneStore.setState(useSceneStore.getInitialState(), true)
})

describe('Services', () => {
  it('stacks the three services, each with a preview, on small screens', () => {
    mockMatchMedia((query) => query === '(width < 768px)')
    renderWithRouter(<Services reducedMotion={false} />)
    expect(section()).toHaveAttribute('data-mode', 'stacked')
    expect(screen.getByRole('heading', { level: 2, name: 'Lo que puedo construir para ti' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
      'Tu web',
      'Tu herramienta',
      'Tu app',
    ])
    expect(screen.getAllByRole('img')).toHaveLength(3)
  })

  it('stacks too when motion is reduced', () => {
    renderWithRouter(<Services reducedMotion />)
    expect(section()).toHaveAttribute('data-mode', 'stacked')
  })

  it('draws still previews, with no animation loop, when stacked', () => {
    renderWithRouter(<Services reducedMotion />)
    expect(MockIntersectionObserver.instances).toHaveLength(0)
  })

  it('links each service to its proof, except the web until the demo exists', () => {
    renderWithRouter(<Services reducedMotion />)
    expect(screen.getByRole('link', { name: /Prueba: SolarMetrics/ })).toHaveAttribute('href', '/casos/solarmetrics')
    expect(screen.getByRole('link', { name: /Prueba: Seenat/ })).toHaveAttribute('href', '/casos/seenat')
    expect(screen.getAllByRole('link')).toHaveLength(2)
  })

  it('keeps every service in the HTML while pinned and starts on the first one', () => {
    renderWithRouter(<Services reducedMotion={false} />)
    expect(section()).toHaveAttribute('data-mode', 'pinned')
    const panels = section().querySelectorAll('.service-panel')
    expect(panels).toHaveLength(3)
    expect(panels[0]).toHaveAttribute('data-active', 'true')
    expect(panels[1]).toHaveAttribute('data-active', 'false')
    expect(section()).toHaveTextContent('Si lo haces a mano cada semana, se puede automatizar.')
    expect(section()).toHaveTextContent('Paneles, áreas de cliente, gestión interna, informes, conexiones entre sistemas.')
  })

  it('shows the service whose link receives keyboard focus, without a transition', () => {
    renderWithRouter(<Services reducedMotion={false} />)
    expect(section()).toHaveAttribute('data-instant', 'false')
    act(() => screen.getByRole('link', { name: /Prueba: Seenat/ }).focus())
    expect(section().querySelectorAll('.service-panel')[2]).toHaveAttribute('data-active', 'true')
    expect(section()).toHaveAttribute('data-instant', 'true')
  })

  it('holds no camera cue until the pin is active, and none when stacked', () => {
    renderWithRouter(<Services reducedMotion />)
    expect(useSceneStore.getState().sceneCue).toBeNull()
  })
})
