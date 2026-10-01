import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import CopyEmailButton from './CopyEmailButton'

const EMAIL = 'miguelangelespeluy@gmail.com'

function setClipboard(value) {
  Object.defineProperty(navigator, 'clipboard', { value, configurable: true })
}

afterEach(() => setClipboard(undefined))

describe('CopyEmailButton', () => {
  it('copies the email and confirms it', async () => {
    const writeText = vi.fn().mockResolvedValue()
    setClipboard({ writeText })
    render(<CopyEmailButton email={EMAIL} />)
    fireEvent.click(screen.getByRole('button', { name: 'Copiar email' }))
    expect(await screen.findByText('Email copiado')).toBeInTheDocument()
    expect(writeText).toHaveBeenCalledWith(EMAIL)
  })

  it('shows the email as a mailto link when the browser refuses to copy', async () => {
    setClipboard({ writeText: vi.fn().mockRejectedValue(new Error('denied')) })
    render(<CopyEmailButton email={EMAIL} />)
    fireEvent.click(screen.getByRole('button', { name: 'Copiar email' }))
    expect(await screen.findByRole('link', { name: EMAIL })).toHaveAttribute('href', `mailto:${EMAIL}`)
    expect(screen.getByRole('status')).toHaveAttribute('data-status', 'failed')
  })

  it('shows the email as a mailto link when there is no clipboard API', async () => {
    setClipboard(undefined)
    render(<CopyEmailButton email={EMAIL} />)
    fireEvent.click(screen.getByRole('button', { name: 'Copiar email' }))
    expect(await screen.findByText(/No se pudo copiar/)).toBeInTheDocument()
  })
})
