import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Acts from '../Acts'
import { getActs } from '../../data/acts'
import { renderWithRouter } from '../../test/router'

describe('Acts render paths', () => {
  it('reduced motion: four static illustrations and nothing pinned', () => {
    const { container } = renderWithRouter(<Acts reducedMotion />)
    expect(container.querySelectorAll('svg.art-svg')).toHaveLength(4)
    expect(container.querySelector('[data-pinned]')).toBeNull()
    expect(container.querySelectorAll('.act-art svg')).toHaveLength(4)
  })

  it('motion allowed: one pinned stage that still holds all four fact sheets as text', () => {
    const { container } = renderWithRouter(<Acts reducedMotion={false} />)
    expect(container.querySelector('[data-pinned]')).toBeInTheDocument()
    expect(container.querySelectorAll('.act-art')).toHaveLength(0)
    const headings = screen.getAllByRole('heading', { level: 3 })
    expect(headings).toHaveLength(4)
    for (const act of getActs('es')) {
      expect(screen.getByText(act.role)).toBeInTheDocument()
      for (const task of act.tasks) expect(screen.getByText(task)).toBeInTheDocument()
    }
  })
})
