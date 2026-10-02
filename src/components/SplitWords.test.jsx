import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SplitWords from './SplitWords'

describe('SplitWords', () => {
  it('wraps every word but keeps the sentence intact for assistive tech', () => {
    const { container } = render(<SplitWords text="Te la  construyo." />)
    expect(container.textContent).toBe('Te la construyo.')
    expect(container.querySelectorAll('.w')).toHaveLength(3)
    expect(container.querySelector('.w-inner')).toBeNull()
  })

  it('adds an inner span to mask each word', () => {
    const { container } = render(<SplitWords text="A medida." mask />)
    expect(container.querySelectorAll('.w.w-mask > .w-inner')).toHaveLength(2)
    expect(container.querySelectorAll('.w')[1].style.getPropertyValue('--i')).toBe('1')
  })
})
