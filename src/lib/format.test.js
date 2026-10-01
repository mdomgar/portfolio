import { describe, expect, it } from 'vitest'
import { formatNumber } from './format'

describe('formatNumber', () => {
  it('uses a decimal comma in Spanish and a point in English', () => {
    expect(formatNumber(9.7, 1, 'es')).toBe('9,7')
    expect(formatNumber(9.7, 1, 'en')).toBe('9.7')
  })

  it('rounds to the requested decimals', () => {
    expect(formatNumber(3.456, 0, 'es')).toBe('3')
  })
})
