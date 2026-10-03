import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import WhoAmI from './WhoAmI'

describe('WhoAmI', () => {
  it('opens with the hook and tells the story', () => {
    render(<WhoAmI reducedMotion />)
    expect(screen.getByRole('heading', { level: 2, name: 'Quién soy' })).toBeInTheDocument()
    expect(screen.getByText('Empecé arreglando ordenadores. Ahora construyo el software que funciona en ellos.')).toBeInTheDocument()
    expect(document.querySelector('.whoami-text')).toHaveTextContent(
      'Pasé por soporte técnico, después por ERP con Odoo y hoy desarrollo herramientas web en Macrosad.',
    )
    expect(screen.getByText('Doble titulación ASIR + DAM · nota media 9,7')).toBeInTheDocument()
  })

  it('walks through the four jobs in order, revealing role and dates on demand', () => {
    render(<WhoAmI reducedMotion />)
    const stops = screen.getAllByRole('button')
    expect(stops.map((stop) => stop.textContent)).toEqual(['Mecaofi', 'Grupo Avanza', 'Intelec', 'Macrosad'])
    fireEvent.click(stops[2])
    expect(stops[2]).toHaveAttribute('data-open', 'true')
    fireEvent.click(stops[2])
    expect(stops[2]).toHaveAttribute('data-open', 'false')
  })

  it('keeps every role and date readable, so the visual reveal claims no collapsed state', () => {
    render(<WhoAmI reducedMotion />)
    for (const stop of screen.getAllByRole('button')) expect(stop).not.toHaveAttribute('aria-expanded')
    expect(screen.getByText('Desarrollador Full Stack y Odoo')).toBeInTheDocument()
    expect(screen.getByText('Marzo – Junio 2024')).toBeInTheDocument()
    expect(screen.getByText('Actual')).toBeInTheDocument()
  })

  it('lights the whole journey at once with reduced motion', () => {
    render(<WhoAmI reducedMotion />)
    expect(document.querySelector('.journey')).toHaveAttribute('data-lit', 'true')
  })
})
