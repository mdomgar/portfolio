import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Process from './Process'

describe('Process', () => {
  it('lists the four steps in order with their promises', () => {
    render(<Process reducedMotion />)
    expect(screen.getByRole('heading', { level: 2, name: 'Cómo trabajo' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
      'Me cuentas tu idea',
      'Propuesta por escrito',
      'Lo construimos juntos',
      'Lanzamiento y después',
    ])
    expect(screen.getByText(/te respondo en menos de 48 h\./)).toBeInTheDocument()
    expect(screen.getByText(/30 días de soporte incluidos tras el lanzamiento\./)).toBeInTheDocument()
  })

  it('shows the whole line and every step at once with reduced motion', () => {
    const { container } = render(<Process reducedMotion />)
    const steps = container.querySelectorAll('.process-step')
    expect([...steps].every((step) => step.dataset.lit === 'true')).toBe(true)
    expect(container.querySelector('#proceso')).not.toHaveAttribute('data-armed', 'true')
  })
})
