import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
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
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('tracks the cursor inside cards, tilts them and pulls buttons towards it', () => {
    render(<Page enabled />)
    const card = screen.getByTestId('card')
    const link = screen.getByRole('link')

    vi.spyOn(card, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 200,
      height: 100,
      right: 200,
      bottom: 100,
      x: 0,
      y: 0,
    })
    vi.spyOn(link, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 100,
      height: 40,
      right: 100,
      bottom: 40,
      x: 0,
      y: 0,
    })

    fireEvent.pointerMove(link, { clientX: 150, clientY: 25 })
    expect(card.style.getPropertyValue('--mx')).toBe('150px')
    expect(card.style.getPropertyValue('--my')).toBe('25px')
    expect(link.style.translate).toBe('25.0px 1.8px')
    expect(card.style.rotate).toBe('0.250 0.250 0 4.24deg')
  })

  it('releases buttons and cards when the cursor leaves them', () => {
    render(<Page enabled />)
    const card = screen.getByTestId('card')
    const link = screen.getByRole('link')

    vi.spyOn(card, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 200,
      height: 100,
      right: 200,
      bottom: 100,
      x: 0,
      y: 0,
    })
    vi.spyOn(link, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 100,
      height: 40,
      right: 100,
      bottom: 40,
      x: 0,
      y: 0,
    })

    fireEvent.pointerMove(link, { clientX: 150, clientY: 25 })
    expect(link.style.translate).toBe('25.0px 1.8px')
    expect(card.style.rotate).toBe('0.250 0.250 0 4.24deg')

    fireEvent.pointerLeave(document.documentElement)
    expect(link.style.translate).toBe('')
    expect(card.style.rotate).toBe('')
  })

  it('clears effects on unmount (cleanup)', () => {
    const { unmount } = render(<Page enabled />)
    const card = screen.getByTestId('card')
    const link = screen.getByRole('link')

    vi.spyOn(card, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 200,
      height: 100,
      right: 200,
      bottom: 100,
      x: 0,
      y: 0,
    })
    vi.spyOn(link, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 100,
      height: 40,
      right: 100,
      bottom: 40,
      x: 0,
      y: 0,
    })

    fireEvent.pointerMove(link, { clientX: 150, clientY: 25 })
    expect(link.style.translate).toBe('25.0px 1.8px')
    expect(card.style.rotate).toBe('0.250 0.250 0 4.24deg')

    unmount()
    expect(link.style.translate).toBe('')
    expect(card.style.rotate).toBe('')
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
