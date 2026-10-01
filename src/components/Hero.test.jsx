import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Hero from './Hero'

describe('Hero', () => {
  it('presents name, role, portrait and calls to action', () => {
    render(<Hero ready reducedMotion />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Miguel Ángel')
    expect(screen.getByText('Web Developer', { selector: '.hero-role-text' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Miguel Ángel con los brazos cruzados' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver proyectos' })).toHaveAttribute('href', '#projects')
    expect(screen.getByRole('link', { name: 'Contactar' })).toHaveAttribute('href', '#contact')
    expect(screen.getByText('Disponible para nuevos proyectos')).toBeInTheDocument()
  })
})
