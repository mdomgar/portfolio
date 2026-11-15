import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Navbar from './Navbar'
import { renderWithRouter } from '../test/router'

describe('Navbar', () => {
  it('links the brand to the home page', () => {
    renderWithRouter(<Navbar />, { route: '/aviso-legal' })
    expect(screen.getByRole('link', { name: 'Miguel Ángel · Inicio' })).toHaveAttribute('href', '/')
  })

  it('links the sections from every page, with only Contacto kept on a phone', () => {
    renderWithRouter(<Navbar />, { route: '/casos/solarmetrics' })
    expect(screen.getByRole('link', { name: 'Trayectoria' })).toHaveAttribute('href', '/#trayectoria')
    expect(screen.getByRole('link', { name: 'Proyectos' })).toHaveAttribute('href', '/#proyectos')
    expect(screen.getByRole('link', { name: 'Contacto' })).toHaveAttribute('href', '/#contacto')
    expect(screen.getByRole('link', { name: 'Contacto' }).closest('li')).not.toHaveClass('navbar-optional')
    expect(screen.getByRole('link', { name: 'Proyectos' }).closest('li')).toHaveClass('navbar-optional')
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
