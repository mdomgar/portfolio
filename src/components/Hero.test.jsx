import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Hero from './Hero'
import { useSceneStore } from '../store/sceneStore'
import { HERO_SEEN_KEY } from '../hooks/useHeroSequence'

beforeEach(() => {
  useSceneStore.setState(useSceneStore.getInitialState(), true)
  window.sessionStorage.clear()
})

afterEach(() => vi.useRealTimers())

const hero = () => document.getElementById('hero')

describe('Hero', () => {
  it('puts the questions, the answer and the calls to action in the HTML', () => {
    render(<Hero ready reducedMotion />)
    const questions = within(screen.getByRole('list')).getAllByRole('listitem').map((item) => item.textContent)
    expect(questions).toEqual([
      '¿Necesitas una web que te traiga clientes?',
      '¿Una herramienta que sustituya tus Excel?',
      '¿Una app que tus usuarios lleven en el bolsillo?',
    ])
    expect(screen.getByRole('heading', { level: 1, name: 'Te la construyo. A medida.' })).toBeInTheDocument()
    expect(screen.getByText(/^Soy Miguel Ángel, desarrollador web\./)).toBeInTheDocument()
    expect(screen.getByText('Web Developer en Macrosad · Creador de Seenat y SolarMetrics')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Cuéntame tu proyecto' })).toHaveAttribute('href', '#brief')
    expect(screen.getByRole('link', { name: 'Ver casos' })).toHaveAttribute('href', '#casos')
    expect(screen.getByRole('img', { name: 'Miguel Ángel con los brazos cruzados' })).toBeInTheDocument()
  })

  it('renders the answer text once, so the neon sweep adds no duplicate copy to the page', () => {
    render(<Hero ready reducedMotion />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading.textContent).toBe('Te la construyo. A medida.')
    expect(heading).toHaveAttribute('data-text', 'Te la construyo. A medida.')
    expect(heading.querySelector('[aria-hidden]')).toBeNull()
    expect(screen.getAllByText(/construyo/)).toHaveLength(1)
  })

  it('shows everything at once with reduced motion and leaves the camera on the open desk', () => {
    render(<Hero ready reducedMotion />)
    expect(hero()).toHaveAttribute('data-moment', '4')
    expect(hero()).toHaveAttribute('data-reduced', 'true')
    expect(useSceneStore.getState().sceneCue).toBeNull()
  })

  it('plays the questions in order, moving the camera, then settles on the answer', () => {
    vi.useFakeTimers()
    render(<Hero ready reducedMotion={false} />)
    expect(hero()).toHaveAttribute('data-moment', '1')
    expect(useSceneStore.getState().sceneCue).toBe('hero-q1')
    act(() => vi.advanceTimersByTime(1700))
    expect(useSceneStore.getState().sceneCue).toBe('hero-q2')
    act(() => vi.advanceTimersByTime(1700))
    expect(useSceneStore.getState().sceneCue).toBe('hero-q3')
    act(() => vi.advanceTimersByTime(1700))
    expect(hero()).toHaveAttribute('data-moment', '4')
    expect(useSceneStore.getState().sceneCue).toBeNull()
    expect(window.sessionStorage.getItem(HERO_SEEN_KEY)).toBe('1')
  })

  it('holds the sequence and the final content back until the page is ready', () => {
    vi.useFakeTimers()
    const { rerender } = render(<Hero ready={false} reducedMotion={false} />)
    act(() => vi.advanceTimersByTime(8000))
    expect(hero()).toHaveAttribute('data-ready', 'false')
    expect(hero()).toHaveAttribute('data-moment', '1')
    rerender(<Hero ready reducedMotion={false} />)
    expect(hero()).toHaveAttribute('data-ready', 'true')
    act(() => vi.advanceTimersByTime(1700))
    expect(hero()).toHaveAttribute('data-moment', '2')
  })

  it('keeps the intro hidden until the page is ready even if it starts on the answer', () => {
    const { rerender, container } = render(<Hero ready={false} reducedMotion />)
    expect(container.querySelector('.hero-body')).toHaveAttribute('data-visible', 'false')
    rerender(<Hero ready reducedMotion />)
    expect(container.querySelector('.hero-body')).toHaveAttribute('data-visible', 'true')
  })

  it('jumps to the answer without animation when a key is pressed', () => {
    render(<Hero ready reducedMotion={false} />)
    fireEvent.keyDown(window, { key: 'Tab' })
    expect(hero()).toHaveAttribute('data-moment', '4')
    expect(hero()).toHaveAttribute('data-instant', 'true')
  })

  it('starts on the answer when it was already seen in this session', () => {
    window.sessionStorage.setItem(HERO_SEEN_KEY, '1')
    render(<Hero ready reducedMotion={false} />)
    expect(hero()).toHaveAttribute('data-moment', '4')
  })

  it('releases its camera cue when it unmounts', () => {
    const { unmount } = render(<Hero ready reducedMotion={false} />)
    expect(useSceneStore.getState().sceneCue).toBe('hero-q1')
    unmount()
    expect(useSceneStore.getState().sceneCue).toBeNull()
  })
})
