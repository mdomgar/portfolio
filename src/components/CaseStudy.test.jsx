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

  it('keeps every piece of the case and a way back to the home page', () => {
    const item = getCase('solarmetrics')
    renderWithRouter(<CaseStudy item={item} reducedMotion />)
    expect(screen.getByText(item.challenge.es)).toBeInTheDocument()
    for (const line of item.built.es) expect(screen.getByText(line)).toBeInTheDocument()
    for (const decision of item.decisions) {
      expect(screen.getByRole('heading', { level: 3, name: decision.title.es })).toBeInTheDocument()
      expect(screen.getByText(decision.why.es)).toBeInTheDocument()
    }
    expect(screen.getByText(item.result.es)).toBeInTheDocument()
    expect(screen.getByText(item.next.es)).toBeInTheDocument()
    const back = screen.getAllByRole('link', { name: 'Volver al inicio' })
    expect(back[0]).toHaveAttribute('href', '/')
  })

  it('names its header for the view transition into the case page', () => {
    renderWithRouter(<CaseStudy item={getCase('solarmetrics')} reducedMotion />)
    expect(screen.getByRole('heading', { level: 1 }).closest('div').style.viewTransitionName).toBe('case-solarmetrics')
  })
})
