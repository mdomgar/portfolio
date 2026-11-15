import { render } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import App, { links } from './root'

// Lenis needs ResizeObserver, which jsdom lacks.
vi.mock('./hooks/useSmoothScroll', () => ({ useSmoothScroll: () => {} }))

const tree = (
  <MemoryRouter>
    <Routes>
      <Route element={<App />}>
        <Route index element={<p>Página</p>} />
      </Route>
    </Routes>
  </MemoryRouter>
)

describe('document links', () => {
  it('loads every font from the site itself, never from a third-party host', () => {
    const hrefs = links().map((link) => link.href)
    expect(hrefs.filter((href) => /^(https?:)?\/\//.test(href))).toEqual([])
    expect(links().filter((link) => link.rel === 'preconnect')).toEqual([])
  })

  it('preloads only the body text on every page', () => {
    const fonts = links().filter((link) => link.rel === 'preload' && link.as === 'font')
    expect(fonts.map((link) => link.href)).toEqual(['/fonts/inter-latin-var.woff2'])
    for (const link of fonts) expect(link).toMatchObject({ type: 'font/woff2', crossOrigin: 'anonymous' })
  })
})

describe('App shell', () => {
  it('never renders main or the navbar as inert, before or after hydration', () => {
    const prerendered = document.createElement('div')
    prerendered.innerHTML = renderToString(tree)
    const { container } = render(tree)
    for (const root of [prerendered, container]) {
      expect(root.querySelector('main')).not.toHaveAttribute('inert')
      expect(root.querySelector('header')).not.toHaveAttribute('inert')
      expect(root.querySelector('main')).toHaveTextContent('Página')
    }
  })
})
