import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Opening from './Opening'
import { renderWithRouter } from '../test/router'

describe('Opening', () => {
  it('puts the name and the role in the page heading', () => {
    renderWithRouter(<Opening reducedMotion />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Miguel Ángel')
    expect(heading).toHaveTextContent('Web developer')
  })

  it('shows the statement and the context, and keeps the sequence slot out of the accessibility tree', () => {
    const { container } = renderWithRouter(<Opening reducedMotion />)
    const section = container.querySelector('#inicio')
    expect(within(section).getByText(/Programo webs y herramientas/)).toBeInTheDocument()
    expect(within(section).getByText('Jaén · Ahora en Macrosad')).toBeInTheDocument()
    expect(section.querySelector('.opening-seq')).toHaveAttribute('aria-hidden', 'true')
  })
})
