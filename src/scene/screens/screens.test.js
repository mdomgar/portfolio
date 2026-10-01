import { describe, expect, it } from 'vitest'
import { tokenizeLine, typedLines } from './code'
import { energyUntil, solarPower } from './solar'

describe('tokenizeLine', () => {
  it('splits a line into highlighted tokens that rebuild the original text', () => {
    const line = "  role: 'Web Developer',"
    const tokens = tokenizeLine(line)
    expect(tokens.map((t) => t.text).join('')).toBe(line)
    expect(tokens.find((t) => t.text === 'role')).toMatchObject({ type: 'key' })
    expect(tokens.find((t) => t.text === "'Web Developer'")).toMatchObject({ type: 'string' })
  })

  it('highlights keywords and booleans', () => {
    const types = Object.fromEntries(tokenizeLine('const ok = true;').map((t) => [t.text, t.type]))
    expect(types.const).toBe('keyword')
    expect(types.true).toBe('boolean')
  })

  it('treats a half-typed string as a string', () => {
    expect(tokenizeLine("  name: 'Mig").at(-1)).toEqual({ text: "'Mig", type: 'string' })
  })
})

describe('typedLines', () => {
  it('reveals text character by character across lines', () => {
    expect(typedLines(['ab', 'cd'], 0)).toEqual([])
    expect(typedLines(['ab', 'cd'], 1)).toEqual(['a'])
    expect(typedLines(['ab', 'cd'], 4)).toEqual(['ab', 'c'])
    expect(typedLines(['ab', 'cd'], 99)).toEqual(['ab', 'cd'])
  })
})

describe('solar model', () => {
  it('produces nothing at night and peaks at 13:00', () => {
    expect(solarPower(3)).toBe(0)
    expect(solarPower(21)).toBe(0)
    expect(solarPower(13)).toBeCloseTo(5.4, 5)
    expect(solarPower(13)).toBeGreaterThan(solarPower(10))
  })

  it('is symmetric around midday', () => {
    expect(solarPower(9)).toBeCloseTo(solarPower(17), 5)
  })

  it('accumulates energy monotonically through the day', () => {
    expect(energyUntil(6)).toBe(0)
    expect(energyUntil(12)).toBeGreaterThan(energyUntil(9))
    expect(energyUntil(20)).toBeCloseTo(energyUntil(24), 5)
  })
})
