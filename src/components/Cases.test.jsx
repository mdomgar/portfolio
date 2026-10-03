import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Cases from './Cases'
import { renderWithRouter } from '../test/router'

describe('Cases', () => {
  it('shows one card per case with an honest label and a link to the case study', () => {
    renderWithRouter(<Cases />)
    expect(screen.getByRole('heading', { level: 2, name: 'Casos' })).toBeInTheDocument()
    const cards = screen.getAllByRole('article')
    expect(cards).toHaveLength(2)
    expect(within(cards[0]).getByText('Herramienta a medida · Proyecto de fin de grado')).toBeInTheDocument()
    expect(within(cards[1]).getByText('App móvil · En desarrollo')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Ver el caso.*SolarMetrics/ })).toHaveAttribute('href', '/casos/solarmetrics')
    expect(screen.getByRole('link', { name: /Ver el caso.*Seenat/ })).toHaveAttribute('href', '/casos/seenat')
  })

  it('only shows real figures', () => {
    renderWithRouter(<Cases />)
    const [solarmetrics, seenat] = screen.getAllByRole('article')
    expect(within(solarmetrics).getByText('API propia que simula una instalación fotovoltaica en tiempo real')).toBeInTheDocument()
    expect(within(seenat).getByText('160+')).toBeInTheDocument()
    expect(within(seenat).getByText('pruebas automáticas en el backend')).toBeInTheDocument()
    expect(within(seenat).getByText('coordenadas guardadas')).toBeInTheDocument()
  })

  it('lists the technologies of each case', () => {
    renderWithRouter(<Cases />)
    const [solarmetrics, seenat] = screen.getAllByRole('list', { name: 'Tecnologías' })
    expect(within(solarmetrics).getAllByRole('listitem')).toHaveLength(7)
    expect(within(seenat).getByText('Flutter')).toBeInTheDocument()
  })

  it('names the card header for the shared transition to the case page', () => {
    renderWithRouter(<Cases />)
    const header = screen.getByRole('heading', { level: 3, name: 'Seenat' }).closest('header')
    expect(header.style.viewTransitionName).toBe('case-seenat')
  })
})
