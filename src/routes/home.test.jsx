import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderPage } from '../test/router'
import Home, { meta } from './home'

describe('home route', () => {
  it('renders the hero with the context from the root layout', async () => {
    renderPage(Home)
    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(document.getElementById('hero')).toBeInTheDocument()
  })

  it('declares its SEO tags', () => {
    const tags = meta()
    expect(tags[0].title).toMatch(/^Miguel Ángel Domínguez · /)
    expect(tags.find((tag) => tag.rel === 'canonical').href).toMatch(/\/$/)
  })
})
