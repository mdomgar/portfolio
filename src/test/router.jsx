import { render } from '@testing-library/react'
import { createRoutesStub, MemoryRouter, Outlet } from 'react-router'

export function renderWithRouter(ui, { route = '/' } = {}) {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>)
}

// Renders a route module the way root.jsx does: inside an <Outlet> that provides { reducedMotion }.
export function renderPage(Page, { path = '/', route = path === '*' ? '/' : path, context } = {}) {
  const outletContext = context ?? { reducedMotion: true }
  function Shell() {
    return <Outlet context={outletContext} />
  }
  const Stub = createRoutesStub([{ Component: Shell, children: [{ path, Component: Page }] }])
  return render(<Stub initialEntries={[route]} />)
}
