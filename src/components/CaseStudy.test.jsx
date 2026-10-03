import { screen, within } from '@testing-library/react'
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
      '¿Tienes algo parecido en mente?',
    ])
    const demo = screen.getByRole('link', { name: /Ver demo/ })
    expect(demo).toHaveAttribute('href', 'https://solarmetrics.vercel.app')
    expect(demo).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getByRole('link', { name: /Código/ })).toHaveAttribute('href', 'https://github.com/mdomgar/SolarMetrics')
    expect(screen.getByRole('img', { name: /panel de SolarMetrics/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Cuéntame tu proyecto' })).toHaveAttribute('href', '/#brief')
  })

  it('tells a project in progress with its privacy flow, real figures and development journal', () => {
    renderWithRouter(<CaseStudy item={getCase('seenat')} reducedMotion />)
    expect(h2s()).toEqual([
      'El reto',
      'Qué estoy construyendo',
      'Qué pasa con tu ubicación',
      'Decisiones clave',
      'Resultado hasta ahora',
      'Siguiente paso',
      'Diario de desarrollo',
      '¿Tienes algo parecido en mente?',
    ])
    expect(screen.queryByRole('link', { name: /Ver demo/ })).not.toBeInTheDocument()
    expect(screen.getByText('160+')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
    const decisions = screen.getByRole('list', { name: 'Decisiones clave' })
    expect(within(decisions).getAllByRole('heading', { level: 3 })).toHaveLength(4)
    expect(screen.getByText('30 de septiembre de 2026')).toHaveAttribute('datetime', '2026-09-30')
  })

  it('shares its header name with the card on the home page', () => {
    renderWithRouter(<CaseStudy item={getCase('seenat')} reducedMotion />)
    expect(screen.getByRole('heading', { level: 1 }).closest('div').style.viewTransitionName).toBe('case-seenat')
  })
})
