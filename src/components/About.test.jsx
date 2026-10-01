import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import About from './About'

describe('About', () => {
  it('shows bio, current role, location, stats and stack', () => {
    render(<About reducedMotion />)
    expect(screen.getByRole('heading', { level: 2, name: 'Sobre mí' })).toBeInTheDocument()
    expect(screen.getByText(/Soy de Jaén/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Web Developer' })).toBeInTheDocument()
    expect(screen.getByText('@ Macrosad')).toBeInTheDocument()
    expect(screen.getByText('Nota media en DAM')).toBeInTheDocument()
    expect(screen.getAllByText('Spring Boot').length).toBeGreaterThan(0)
  })
})
