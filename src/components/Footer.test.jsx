import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Footer from './Footer'
import { renderWithRouter } from '../test/router'

describe('Footer', () => {
  it('shows the copyright, the legal notice and the name', () => {
    renderWithRouter(<Footer />)
    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveTextContent(`© ${new Date().getFullYear()} Miguel Ángel Domínguez García`)
    expect(screen.queryByRole('link', { name: 'Privacidad' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Aviso legal' })).toHaveAttribute('href', '/aviso-legal')
  })
})
