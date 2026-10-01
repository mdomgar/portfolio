import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { mockMatchMedia } from '../test/mocks'
import Reveal from './Reveal'

describe('Reveal', () => {
  it('renders its children visible when motion is reduced', () => {
    mockMatchMedia((query) => query === '(prefers-reduced-motion: reduce)')
    render(
      <Reveal as="ul" className="list">
        <li>Uno</li>
      </Reveal>,
    )
    const item = screen.getByText('Uno')
    expect(item.parentElement.tagName).toBe('UL')
    expect(item.parentElement).toHaveClass('list')
    expect(item).not.toHaveStyle({ opacity: '0' })
  })
})
