import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Contact from './Contact'

describe('Contact', () => {
  it('offers email, LinkedIn and GitHub', () => {
    render(<Contact />)
    expect(screen.getByRole('heading', { level: 2, name: '¿Hablamos?' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Escribir email' })).toHaveAttribute('href', 'mailto:miguelangelespeluy@gmail.com')
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/mdomgar')
  })
})
