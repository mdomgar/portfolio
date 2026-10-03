import { render } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import App, { links } from './root'

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
  it('never prerenders main or the navbar as inert, so the page still works if the JavaScript fails', () => {
    const container = document.createElement('div')
    container.innerHTML = renderToString(tree)
    expect(container.querySelector('main')).not.toHaveAttribute('inert')
    expect(container.querySelector('header')).not.toHaveAttribute('inert')
    expect(container.querySelector('main')).toHaveTextContent('Página')
  })

  it('locks main and the navbar behind the preloader once hydrated', () => {
    const { container } = render(tree)
    expect(container.querySelector('main')).toHaveAttribute('inert')
    expect(container.querySelector('header')).toHaveAttribute('inert')
  })
})
