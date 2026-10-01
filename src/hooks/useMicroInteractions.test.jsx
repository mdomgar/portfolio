import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { mockMatchMedia } from '../test/mocks'
import { useMicroInteractions } from './useMicroInteractions'

function Page({ enabled }) {
  useMicroInteractions(enabled)
  return (
    <>
      <article className="card" data-tilt data-testid="card">
        <a className="btn" href="#x">
          Botón
        </a>
      </article>
      <p data-testid="outside">fuera</p>
    </>
  )
}

describe('useMicroInteractions', () => {
  it('tracks the cursor inside cards, tilts them and pulls buttons towards it', () => {
    render(<Page enabled />)
    fireEvent.pointerMove(screen.getByRole('link'), { clientX: 40, clientY: 20 })
    const card = screen.getByTestId('card')
    expect(card.style.getPropertyValue('--mx')).toBe('40px')
    expect(card.style.getPropertyValue('--my')).toBe('20px')
    expect(card.style.rotate).not.toBe('')
    expect(screen.getByRole('link').style.translate).not.toBe('')
  })

  it('releases buttons and cards when the cursor leaves them', () => {
    render(<Page enabled />)
    fireEvent.pointerMove(screen.getByRole('link'), { clientX: 40, clientY: 20 })
    fireEvent.pointerMove(screen.getByTestId('outside'), { clientX: 400, clientY: 400 })
    expect(screen.getByRole('link').style.translate).toBe('')
    expect(screen.getByTestId('card').style.rotate).toBe('')
  })

  it('does nothing when disabled or on touch screens', () => {
    const { unmount } = render(<Page enabled={false} />)
    fireEvent.pointerMove(screen.getByRole('link'), { clientX: 40, clientY: 20 })
    expect(screen.getByTestId('card').style.getPropertyValue('--mx')).toBe('')
    unmount()

    mockMatchMedia((query) => query === '(pointer: coarse)')
    render(<Page enabled />)
    fireEvent.pointerMove(screen.getByRole('link'), { clientX: 40, clientY: 20 })
    expect(screen.getByTestId('card').style.getPropertyValue('--mx')).toBe('')
  })
})
