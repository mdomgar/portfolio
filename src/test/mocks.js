import { vi } from 'vitest'

export function mockMatchMedia(matchesFn = () => false) {
  const listeners = new Set()
  window.matchMedia = vi.fn((query) => ({
    get matches() {
      return matchesFn(query)
    },
    media: query,
    onchange: null,
    addEventListener: (_type, cb) => listeners.add(cb),
    removeEventListener: (_type, cb) => listeners.delete(cb),
    addListener: (cb) => listeners.add(cb),
    removeListener: (cb) => listeners.delete(cb),
    dispatchEvent: () => true,
  }))
  return { emit: (matches) => listeners.forEach((cb) => cb({ matches })) }
}

export class MockIntersectionObserver {
  static instances = []

  constructor(callback, options) {
    this.callback = callback
    this.options = options
    this.elements = new Set()
    MockIntersectionObserver.instances.push(this)
  }

  observe(el) {
    this.elements.add(el)
  }

  unobserve(el) {
    this.elements.delete(el)
  }

  disconnect() {
    this.elements.clear()
  }

  trigger(entries) {
    this.callback(entries, this)
  }
}
