import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Navbar from './Navbar'
import { renderWithRouter } from '../test/router'

describe('Navbar', () => {
  it('links the brand to the home page', () => {
    renderWithRouter(<Navbar />, { route: '/aviso-legal' })
    expect(screen.getByRole('link', { name: 'MDG · Inicio' })).toHaveAttribute('href', '/')
  })

  it('is never inert, so it works before and without the JavaScript', () => {
    renderWithRouter(<Navbar />)
    expect(document.querySelector('header')).not.toHaveAttribute('inert')
  })

  it('offers a skip link to the main content', () => {
    renderWithRouter(<Navbar />)
    expect(screen.getByRole('link', { name: 'Saltar al contenido' })).toHaveAttribute('href', '#main')
  })
})
