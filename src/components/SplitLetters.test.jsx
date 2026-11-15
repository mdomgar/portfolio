import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SplitLetters from './SplitLetters'

describe('SplitLetters', () => {
  it('keeps the word readable as one piece of text and hides the individual letters', () => {
    const { container } = render(<h2><SplitLetters text="Hablemos" /></h2>)
    expect(screen.getByRole('heading', { name: 'Hablemos' })).toBeInTheDocument()
    expect(container.querySelectorAll('.l-inner')).toHaveLength(8)
    expect(container.querySelector('.letters')).toHaveAttribute('aria-hidden', 'true')
  })
})
