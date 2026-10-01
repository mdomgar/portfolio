import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import { mockMatchMedia, MockIntersectionObserver } from './mocks'

window.IntersectionObserver = MockIntersectionObserver
globalThis.IntersectionObserver = MockIntersectionObserver
HTMLCanvasElement.prototype.getContext = () => null
window.scrollTo = () => {}
mockMatchMedia(() => false)

beforeEach(() => {
  mockMatchMedia(() => false)
})

afterEach(() => {
  cleanup()
  MockIntersectionObserver.instances = []
})
