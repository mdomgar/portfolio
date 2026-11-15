import { describe, it, expect } from 'vitest'
import { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { SEQUENCE, frameUrl } from './sequence.js'

const publicDir = 'public'
const dirBytes = (dir) =>
  readdirSync(dir).reduce((sum, f) => sum + statSync(join(dir, f)).size, 0)

describe('SEQUENCE', () => {
  it('builds 1-based, 4-digit frame urls', () => {
    expect(frameUrl('desktop', 1)).toBe('/seq/desktop/0001.webp')
    expect(frameUrl('mobile', 60)).toBe('/seq/mobile/0060.webp')
  })

  it('uses the ink colour for the screen', () => {
    expect(SEQUENCE.screenColor).toBe('#121212')
  })

  it('has a sane desktop and mobile shape', () => {
    expect(SEQUENCE.desktop.count).toBeGreaterThanOrEqual(90)
    expect(SEQUENCE.desktop.count).toBeLessThanOrEqual(120)
    expect(SEQUENCE.desktop.width).toBeGreaterThan(SEQUENCE.desktop.height)
    expect(SEQUENCE.mobile.height).toBeGreaterThan(SEQUENCE.mobile.width)
  })

  for (const [variant, budget] of [
    ['desktop', 4 * 1024 * 1024],
    ['mobile', 1.5 * 1024 * 1024],
  ]) {
    it(`${variant}: every frame exists and total size is within budget`, () => {
      const { count } = SEQUENCE[variant]
      for (let i = 1; i <= count; i += 1) {
        const file = join(publicDir, frameUrl(variant, i))
        expect(existsSync(file), file).toBe(true)
      }
      expect(dirBytes(join(publicDir, 'seq', variant))).toBeLessThanOrEqual(budget)
    })
  }
})
