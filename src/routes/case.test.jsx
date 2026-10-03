import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import CasePage, { meta } from './case'
import { renderPage } from '../test/router'
import { useSceneStore } from '../store/sceneStore'

beforeEach(() => {
  useSceneStore.setState(useSceneStore.getInitialState(), true)
})

describe('case route', () => {
  it('renders the case for the current URL and dims the scene', async () => {
    renderPage(CasePage, { path: '/casos/seenat' })
    expect(await screen.findByRole('heading', { level: 1, name: 'Seenat' })).toBeInTheDocument()
    expect(useSceneStore.getState().section).toBe('case')
  })

  it('falls back to the not-found content for an unknown case', async () => {
    renderPage(CasePage, { path: '/casos/:slug', route: '/casos/nope' })
    expect(await screen.findByRole('heading', { level: 1, name: 'Esta página no existe' })).toBeInTheDocument()
  })

  it('declares the case SEO as an article', () => {
    const tags = meta({ location: { pathname: '/casos/solarmetrics' } })
    expect(tags[0].title).toBe('SolarMetrics · Caso de estudio · Miguel Ángel Domínguez')
    expect(tags.find((tag) => tag.property === 'og:type').content).toBe('article')
    expect(tags.find((tag) => tag.rel === 'canonical').href).toMatch(/\/casos\/solarmetrics$/)
  })
})
