import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MockIntersectionObserver } from '../test/mocks'
import CountUp from './CountUp'

describe('CountUp', () => {
  it('shows the final value straight away when motion is reduced', () => {
    render(<CountUp value={9.7} decimals={1} reducedMotion />)
    expect(screen.getByText('9,7', { selector: '[aria-hidden="true"]' })).toBeInTheDocument()
  })

  it('starts at zero and waits until it is visible', () => {
    render(<CountUp value={4} reducedMotion={false} />)
    expect(screen.getByText('0', { selector: '[aria-hidden="true"]' })).toBeInTheDocument()
    expect(MockIntersectionObserver.instances).toHaveLength(1)
  })

  it('always exposes the final value to screen readers', () => {
    render(<CountUp value={3} suffix="+" reducedMotion={false} />)
    expect(screen.getByText('3+', { selector: '.sr-only' })).toBeInTheDocument()
  })
})
