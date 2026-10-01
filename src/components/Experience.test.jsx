import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Experience from './Experience'

describe('Experience', () => {
  it('lists jobs from newest to oldest and highlights the current one', () => {
    render(<Experience reducedMotion />)
    const items = screen.getAllByRole('listitem').filter((li) => li.classList.contains('timeline-item'))
    expect(items.map((li) => within(li).getByRole('heading', { level: 3 }).textContent)).toEqual([
      'Web Developer',
      'Técnico Auxiliar IT',
      'Desarrollador Full Stack y Odoo',
      'Técnico Informático',
    ])
    expect(items[0]).toHaveClass('is-current')
    expect(within(items[0]).getByText('Actual')).toBeInTheDocument()
    expect(within(items[1]).queryByText('Actual')).not.toBeInTheDocument()
  })
})
