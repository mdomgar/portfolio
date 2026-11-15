import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Today from './Today'
import { capabilities } from '../data/capabilities'
import { renderWithRouter } from '../test/router'

describe('Today', () => {
  it('lists every capability with its proof', () => {
    renderWithRouter(<Today reducedMotion />)
    expect(screen.getByRole('heading', { level: 2, name: 'Qué hago hoy' })).toBeInTheDocument()
    for (const capability of capabilities) {
      expect(screen.getByText(capability.title.es)).toBeInTheDocument()
      expect(screen.getByText(capability.proof.es)).toBeInTheDocument()
    }
  })

  it('keeps the technology strip out of the accessibility tree but in the page', () => {
    const { container } = renderWithRouter(<Today reducedMotion />)
    const strip = container.querySelector('.today-strip')
    expect(strip).toHaveAttribute('aria-hidden', 'true')
    expect(strip).toHaveTextContent('React')
    expect(strip).toHaveTextContent('Spring Boot')
  })
})
