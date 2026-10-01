import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Education from './Education'

describe('Education', () => {
  it('shows both degrees with their grades out of 10', () => {
    render(<Education />)
    expect(screen.getByRole('heading', { level: 3, name: /Desarrollo de Aplicaciones Multiplataforma/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: /Administración de Sistemas Informáticos en Red/ })).toBeInTheDocument()
    expect(screen.getByText('9.7 / 10')).toBeInTheDocument()
    expect(screen.getByText('9.4 / 10')).toBeInTheDocument()
  })
})
