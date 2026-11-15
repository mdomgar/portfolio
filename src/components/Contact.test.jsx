import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Contact from './Contact'
import { profile } from '../data/profile'
import { renderWithRouter } from '../test/router'

describe('Contact', () => {
  it('offers the copy-email button and the LinkedIn and GitHub links', () => {
    const { container } = renderWithRouter(<Contact reducedMotion />)
    expect(container.querySelector('#contacto')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Hablemos' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Copiar email' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /LinkedIn/ })).toHaveAttribute('href', profile.linkedin)
    expect(screen.getByRole('link', { name: /GitHub/ })).toHaveAttribute('href', profile.github)
  })
})
