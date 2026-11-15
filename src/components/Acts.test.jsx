import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Acts from './Acts'
import { getActs } from '../data/acts'
import { renderWithRouter } from '../test/router'

describe('Acts', () => {
  it('renders four acts, each with its role, company and real period', () => {
    renderWithRouter(<Acts reducedMotion />)
    const acts = getActs('es')
    const headings = screen.getAllByRole('heading', { level: 3 })
    expect(headings).toHaveLength(4)
    acts.forEach((act, index) => {
      expect(headings[index]).toHaveTextContent(act.role)
      const article = headings[index].closest('article')
      expect(article).toHaveTextContent(act.company)
      expect(article).toHaveTextContent(act.period)
      expect(article).toHaveTextContent(`Acto 0${index + 1} / 04`)
      expect(article.querySelector('.act-art')).toHaveAttribute('data-act', act.id)
      for (const task of act.tasks) expect(within(article).getByText(task)).toBeInTheDocument()
    })
  })

  it('is not presented as a timeline', () => {
    const { container } = renderWithRouter(<Acts reducedMotion />)
    expect(container.querySelector('#trayectoria')).toBeInTheDocument()
    expect(container.querySelector('ol')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'De arreglar ordenadores a programarlos' })).toBeInTheDocument()
  })
})
