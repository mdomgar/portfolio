import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./gsap', () => ({ ScrollTrigger: { refresh: vi.fn() } }))

// Each test gets a fresh module: the landing is one session per page load.
async function load() {
  vi.resetModules()
  return import('./hashLanding')
}

beforeEach(() => {
  vi.useFakeTimers()
  document.body.innerHTML = '<section id="proyectos"></section>'
})

afterEach(() => {
  vi.useRealTimers()
  window.location.hash = ''
})

describe('landOnHash', () => {
  it('does not throw on a malformed hash', async () => {
    window.location.hash = '#%E0%A4%A'
    const { landOnHash } = await load()
    const scrollTo = vi.spyOn(window, 'scrollTo')
    landOnHash()
    expect(() => vi.advanceTimersByTime(100)).not.toThrow()
    expect(scrollTo).not.toHaveBeenCalled()
  })

  it('jumps once for all stages, and not again after the visitor has scrolled', async () => {
    window.location.hash = '#proyectos'
    const { landOnHash } = await load()
    const scrollTo = vi.spyOn(window, 'scrollTo')
    landOnHash()
    landOnHash()
    vi.advanceTimersByTime(50)
    await Promise.resolve()
    expect(scrollTo.mock.calls.length).toBeLessThanOrEqual(2)
    const calls = scrollTo.mock.calls.length
    window.dispatchEvent(new Event('wheel'))
    await vi.advanceTimersByTimeAsync(100)
    expect(scrollTo.mock.calls.length).toBe(calls)
  })
})
