import { render } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import App from './root'

const tree = (
  <MemoryRouter>
    <Routes>
      <Route element={<App />}>
        <Route index element={<p>Página</p>} />
      </Route>
    </Routes>
  </MemoryRouter>
)

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
