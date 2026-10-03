import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Now from './Now'

describe('Now', () => {
  it('says what I am up to and when it was updated', () => {
    render(<Now />)
    expect(screen.getByRole('heading', { level: 2, name: 'Ahora mismo' })).toBeInTheDocument()
    expect(screen.getByText('octubre 2026')).toHaveAttribute('datetime', '2026-10-01')
    expect(screen.getByText('Construyendo:')).toBeInTheDocument()
    expect(screen.getByText(/herramientas internas en mi trabajo y Seenat, mi app en Flutter\./)).toBeInTheDocument()
    expect(screen.getByText(/los problemas difíciles; ahí es donde más aprendo\./)).toBeInTheDocument()
  })
})
