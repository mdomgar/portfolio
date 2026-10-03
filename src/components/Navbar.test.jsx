import { act, fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import Navbar from './Navbar'
import { renderWithRouter } from '../test/router'
import { useSceneStore } from '../store/sceneStore'

beforeEach(() => {
  useSceneStore.setState(useSceneStore.getInitialState(), true)
})

const sectionLinks = () =>
  screen.getAllByRole('listitem').map((item) => item.querySelector('a')).filter((a) => !a.classList.contains('navbar-cta'))

describe('Navbar', () => {
  it('links to the home sections with anchors while on the home page', () => {
    renderWithRouter(<Navbar />)
    expect(sectionLinks().map((a) => a.getAttribute('href'))).toEqual(['#servicios', '#casos', '#proceso', '#quien-soy'])
    expect(screen.getByRole('link', { name: 'Cuéntame tu proyecto' })).toHaveAttribute('href', '#brief')
    expect(screen.getByRole('link', { name: 'MDG · Inicio' })).toHaveAttribute('href', '#hero')
  })

  it('goes back to the home page sections from any other page', () => {
    renderWithRouter(<Navbar />, { route: '/casos/seenat' })
    expect(sectionLinks().map((a) => a.getAttribute('href'))).toEqual([
      '/#servicios',
      '/#casos',
      '/#proceso',
      '/#quien-soy',
    ])
    expect(screen.getByRole('link', { name: 'Cuéntame tu proyecto' })).toHaveAttribute('href', '/#brief')
    expect(screen.getByRole('link', { name: 'MDG · Inicio' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Casos' })).toHaveAttribute('aria-current', 'true')
  })

  it('hides the Lab until phase B', () => {
    renderWithRouter(<Navbar />)
    expect(screen.queryByRole('link', { name: 'Lab' })).not.toBeInTheDocument()
  })

  it('opens the mobile menu and closes it after choosing a link', () => {
    renderWithRouter(<Navbar />)
    const toggle = screen.getByRole('button', { name: 'Abrir menú' })
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(toggle).toHaveAccessibleName('Cerrar menú')
    fireEvent.click(screen.getByRole('link', { name: 'Casos' }))
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes the mobile menu with Escape', () => {
    renderWithRouter(<Navbar />)
    const toggle = screen.getByRole('button', { name: 'Abrir menú' })
    fireEvent.click(toggle)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('marks the active section on the home page', () => {
    renderWithRouter(<Navbar />)
    act(() => useSceneStore.getState().setSection('proceso'))
    expect(screen.getByRole('link', { name: 'Cómo trabajo' })).toHaveAttribute('aria-current', 'true')
    expect(screen.getByRole('link', { name: 'Casos' })).not.toHaveAttribute('aria-current')
  })

  it('is inert until the page is ready', () => {
    const view = renderWithRouter(<Navbar ready={false} />)
    expect(document.querySelector('header')).toHaveAttribute('inert')
    view.unmount()
    renderWithRouter(<Navbar ready />)
    expect(document.querySelector('header')).not.toHaveAttribute('inert')
  })

  it('offers a skip link to the main content', () => {
    renderWithRouter(<Navbar />)
    expect(screen.getByRole('link', { name: 'Saltar al contenido' })).toHaveAttribute('href', '#main')
  })
})
