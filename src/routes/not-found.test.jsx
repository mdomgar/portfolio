import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderPage } from '../test/router'
import NotFound, { meta } from './not-found'

describe('not-found route', () => {
  it('explains the page does not exist and links back home', async () => {
    renderPage(NotFound, { path: '*', route: '/no-existe' })
    expect(await screen.findByRole('heading', { level: 1, name: 'Esta página no existe' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/')
  })

  it('is never indexed', () => {
    expect(meta().find((tag) => tag.name === 'robots').content).toBe('noindex')
  })
})
