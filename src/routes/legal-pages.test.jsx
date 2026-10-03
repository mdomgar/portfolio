import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import Privacy, { meta as privacyMeta } from './privacy'
import Legal, { meta as legalMeta } from './legal'
import { renderPage } from '../test/router'
import { useSceneStore } from '../store/sceneStore'

beforeEach(() => {
  useSceneStore.setState(useSceneStore.getInitialState(), true)
})

describe('legal routes', () => {
  it('renders the privacy policy with the contact email filled in', async () => {
    renderPage(Privacy, { path: '/privacidad' })
    expect(await screen.findByRole('heading', { level: 1, name: 'Política de privacidad' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Tus derechos' })).toBeInTheDocument()
    expect(screen.getAllByText(/miguelangelespeluy@gmail\.com/).length).toBeGreaterThan(0)
    expect(document.body).not.toHaveTextContent('{email}')
    expect(useSceneStore.getState().section).toBe('case')
    expect(privacyMeta()[0].title).toBe('Privacidad · Miguel Ángel Domínguez')
  })

  it('renders the legal notice with the owner details', async () => {
    renderPage(Legal, { path: '/aviso-legal' })
    expect(await screen.findByRole('heading', { level: 1, name: 'Aviso legal' })).toBeInTheDocument()
    expect(screen.getByText('Titular', { selector: 'dt' })).toBeInTheDocument()
    expect(legalMeta()[0].title).toBe('Aviso legal · Miguel Ángel Domínguez')
  })
})
