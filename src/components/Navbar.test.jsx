import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import Navbar from './Navbar'
import { useSceneStore } from '../store/sceneStore'

beforeEach(() => {
  useSceneStore.setState(useSceneStore.getInitialState(), true)
})

const navLinks = () => screen.getAllByRole('link').filter((a) => !['#main', '#hero'].includes(a.getAttribute('href')))

describe('Navbar', () => {
  it('links to every content section in page order', () => {
    render(<Navbar />)
    expect(navLinks().map((a) => a.getAttribute('href'))).toEqual([
      '#about',
      '#experience',
      '#projects',
      '#education',
      '#contact',
    ])
  })

  it('opens the mobile menu and closes it after choosing a link', () => {
    render(<Navbar />)
    const toggle = screen.getByRole('button', { name: 'Abrir menú' })
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(toggle).toHaveAccessibleName('Cerrar menú')
    fireEvent.click(screen.getByRole('link', { name: 'Proyectos' }))
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes the mobile menu with Escape', () => {
    render(<Navbar />)
    const toggle = screen.getByRole('button', { name: 'Abrir menú' })
    fireEvent.click(toggle)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('marks the active section', () => {
    render(<Navbar />)
    act(() => useSceneStore.getState().setSection('experience'))
    expect(screen.getByRole('link', { name: 'Experiencia' })).toHaveAttribute('aria-current', 'true')
    expect(screen.getByRole('link', { name: 'Proyectos' })).not.toHaveAttribute('aria-current')
  })

  it('is inert until the page is ready', () => {
    const { container, rerender } = render(<Navbar ready={false} />)
    expect(container.querySelector('header')).toHaveAttribute('inert')
    rerender(<Navbar ready />)
    expect(container.querySelector('header')).not.toHaveAttribute('inert')
  })

  it('offers a skip link to the main content', () => {
    render(<Navbar />)
    expect(screen.getByRole('link', { name: 'Saltar al contenido' })).toHaveAttribute('href', '#main')
  })
})
