import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Background from './Background'
import { profile } from '../data/profile'
import { renderWithRouter } from '../test/router'

describe('Background', () => {
  it('shows the education line and the grouped stack', () => {
    const { container } = renderWithRouter(<Background reducedMotion />)
    expect(container.querySelector('#formacion')).toBeInTheDocument()
    expect(screen.getByText(profile.about.education.es)).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Frontend' })).toHaveTextContent('React')
    expect(screen.getByRole('list', { name: 'Backend' })).toHaveTextContent('Spring Boot')
  })
})
