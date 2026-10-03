import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderPage } from '../test/router'
import { SECTION_IDS } from '../data/sections'
import Home, { links, meta } from './home'

describe('home route', () => {
  it('renders the hero with the context from the root layout', async () => {
    renderPage(Home)
    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(document.getElementById('hero')).toBeInTheDocument()
  })

  it('renders every home section in page order', async () => {
    renderPage(Home)
    await screen.findByRole('heading', { level: 1 })
    expect([...document.querySelectorAll('section[id]')].map((section) => section.id)).toEqual(SECTION_IDS)
  })

  it('preloads the hero h1 display face from the site itself', () => {
    const fonts = links().filter((link) => link.as === 'font')
    expect(fonts).toEqual([
      { rel: 'preload', href: '/fonts/clash-display-700.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
    ])
  })

  it('declares its SEO tags', () => {
    const tags = meta()
    expect(tags[0].title).toMatch(/^Miguel Ángel Domínguez · /)
    expect(tags.find((tag) => tag.rel === 'canonical').href).toMatch(/\/$/)
    const jsonLd = tags.find((tag) => 'script:ld+json' in tag)['script:ld+json']
    expect(jsonLd['@graph'].map((node) => node['@type'])).toEqual(['Person', 'ProfessionalService'])
  })
})
