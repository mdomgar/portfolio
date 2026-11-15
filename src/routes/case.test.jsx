import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CasePage, { meta } from './case'
import { renderPage } from '../test/router'

describe('case route', () => {
  it('renders the case for the current URL', async () => {
    renderPage(CasePage, { path: '/casos/solarmetrics' })
    expect(await screen.findByRole('heading', { level: 1, name: 'SolarMetrics' })).toBeInTheDocument()
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
