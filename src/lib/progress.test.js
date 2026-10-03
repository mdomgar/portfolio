import { describe, expect, it } from 'vitest'
import { stepForProgress } from './progress'

describe('stepForProgress', () => {
  it('splits the pinned scroll into equal parts', () => {
    expect(stepForProgress(0, 3)).toBe(0)
    expect(stepForProgress(0.32, 3)).toBe(0)
    expect(stepForProgress(0.34, 3)).toBe(1)
    expect(stepForProgress(0.99, 3)).toBe(2)
  })

  it('stays inside the range at the edges', () => {
    expect(stepForProgress(1, 3)).toBe(2)
    expect(stepForProgress(-0.2, 3)).toBe(0)
    expect(stepForProgress(1.4, 3)).toBe(2)
  })
})
