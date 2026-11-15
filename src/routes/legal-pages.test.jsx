import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Legal, { meta as legalMeta } from './legal'
import { renderPage } from '../test/router'

describe('legal routes', () => {
  it('renders the legal notice with the owner details', async () => {
    renderPage(Legal, { path: '/aviso-legal' })
    expect(await screen.findByRole('heading', { level: 1, name: 'Aviso legal' })).toBeInTheDocument()
    expect(screen.getByText('Titular', { selector: 'dt' })).toBeInTheDocument()
    expect(legalMeta()[0].title).toBe('Aviso legal · Miguel Ángel Domínguez')
  })
})
