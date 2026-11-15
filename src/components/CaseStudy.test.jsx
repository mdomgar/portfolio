import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CaseStudy from './CaseStudy'
import { getCase } from '../data/cases'
import { renderWithRouter } from '../test/router'

const h2s = () => screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)

describe('CaseStudy', () => {
  it('tells a finished project as challenge, build, decisions, result and what I would change', () => {
    renderWithRouter(<CaseStudy item={getCase('solarmetrics')} reducedMotion />)
    expect(screen.getByRole('heading', { level: 1, name: 'SolarMetrics' })).toBeInTheDocument()
    expect(screen.getByText('Herramienta a medida · Proyecto de fin de grado')).toBeInTheDocument()
    expect(h2s()).toEqual([
      'El reto',
      'Qué construí',
      'Decisiones clave',
      'Resultado',
      'Qué haría distinto',
    ])
    const demo = screen.getByRole('link', { name: /Ver demo/ })
    expect(demo).toHaveAttribute('href', 'https://solarmetrics.vercel.app')
    expect(demo).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getByRole('link', { name: /Código/ })).toHaveAttribute('href', 'https://github.com/mdomgar/SolarMetrics')
    expect(screen.getByRole('img', { name: /panel de SolarMetrics/ })).toBeInTheDocument()
  })

  it('shares its header name with the card on the home page', () => {
    renderWithRouter(<CaseStudy item={getCase('solarmetrics')} reducedMotion />)
    expect(screen.getByRole('heading', { level: 1 }).closest('div').style.viewTransitionName).toBe('case-solarmetrics')
  })
})
