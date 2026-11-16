import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Projects from './Projects'
import { renderWithRouter } from '../test/router'

describe('Projects', () => {
  it('links SolarMetrics to its case page', () => {
    renderWithRouter(<Projects reducedMotion />)
    const links = screen.getAllByRole('link').filter((link) => link.getAttribute('href') === '/casos/solarmetrics')
    expect(links.length).toBeGreaterThan(0)
  })

  it('shows Vulcania as text only, in construction', () => {
    renderWithRouter(<Projects reducedMotion />)
    const item = screen.getByText('Vulcania').closest('li')
    expect(within(item).getByText('En construcción')).toBeInTheDocument()
    expect(within(item).getByText(/juegos de mesa de Jaén/)).toBeInTheDocument()
    expect(within(item).queryByRole('link')).not.toBeInTheDocument()
    expect(item.querySelector('img, canvas')).not.toBeInTheDocument()
  })

  it('offers the case, demo and code actions with the right targets', () => {
    renderWithRouter(<Projects reducedMotion />)
    expect(screen.getByRole('link', { name: /Ver el caso/ })).toHaveAttribute('href', '/casos/solarmetrics')
    expect(screen.getByRole('link', { name: /Ver demo/ })).toHaveAttribute('href', 'https://solarmetrics.vercel.app')
    expect(screen.getByRole('link', { name: /Código/ })).toHaveAttribute('href', 'https://github.com/mdomgar/SolarMetrics')
    expect(screen.getByText('Vulcania').closest('li').querySelector('a')).toBeNull()
  })
})
