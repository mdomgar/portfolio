import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import { mockMatchMedia, MockIntersectionObserver } from './mocks'

// Server-side tests run with `@vitest-environment node`: only touch browser globals when they exist.
const hasDom = typeof window !== 'undefined'

if (hasDom) {
  if (!window.PointerEvent) window.PointerEvent = window.MouseEvent
  window.IntersectionObserver = MockIntersectionObserver
  window.scrollTo = () => {}
  HTMLCanvasElement.prototype.getContext = () => null
  mockMatchMedia(() => false)
}
globalThis.IntersectionObserver = MockIntersectionObserver

beforeEach(() => {
  if (hasDom) mockMatchMedia(() => false)
})

afterEach(() => {
  if (hasDom) cleanup()
  MockIntersectionObserver.instances = []
})
