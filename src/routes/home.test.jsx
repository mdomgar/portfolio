import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderPage } from '../test/router'
import Home, { meta } from './home'

describe('home route', () => {
  it('renders the name and the role as the page heading', async () => {
    renderPage(Home)
    expect(await screen.findByRole('heading', { level: 1, name: /Miguel Ángel,\s*Web developer/ })).toBeInTheDocument()
  })

  it('renders the six sections in order', async () => {
    renderPage(Home)
    await screen.findByRole('heading', { level: 1 })
    const ids = [...document.querySelectorAll('section[id]')].map((section) => section.id)
    expect(ids).toEqual(['inicio', 'hoy', 'trayectoria', 'proyectos', 'formacion', 'contacto'])
  })

  it('declares its SEO tags', () => {
    const tags = meta()
    expect(tags[0].title).toMatch(/^Miguel Ángel Domínguez · /)
    expect(tags.find((tag) => tag.rel === 'canonical').href).toMatch(/\/$/)
    const jsonLd = tags.find((tag) => 'script:ld+json' in tag)['script:ld+json']
    expect(jsonLd['@graph'].map((node) => node['@type'])).toEqual(['Person', 'ProfessionalService'])
  })
})
