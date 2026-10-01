import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Projects from './Projects'

describe('Projects', () => {
  it('presents SolarMetrics as a case study with safe external links', () => {
    render(<Projects reducedMotion />)
    expect(screen.getByRole('heading', { level: 3, name: 'SolarMetrics' })).toBeInTheDocument()
    expect(screen.getByText('El problema')).toBeInTheDocument()
    expect(screen.getByText('La solución')).toBeInTheDocument()
    const live = screen.getByRole('link', { name: /Ver demo/ })
    expect(live).toHaveAttribute('href', 'https://solarmetrics.vercel.app')
    expect(live).toHaveAttribute('target', '_blank')
    expect(live).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getByRole('link', { name: /Código/ })).toHaveAttribute('href', 'https://github.com/mdomgar/SolarMetrics')
    expect(screen.getByRole('img', { name: /panel de SolarMetrics/ })).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Stack tecnológico' }).children).toHaveLength(6)
  })
})
