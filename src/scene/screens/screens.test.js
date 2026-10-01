import { describe, expect, it } from 'vitest'
import { drawCode, tokenizeLine, typedLines } from './code'
import { drawTerminal } from './terminal'
import { DASHBOARD_LABELS, drawDashboard } from './dashboard'
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

const GRADIENT = { addColorStop() {} }

function createRecordingContext() {
  const calls = []
  const ctx = {}
  const methods = [
    'fillRect', 'fillText', 'beginPath', 'arc', 'fill', 'moveTo', 'lineTo',
    'closePath', 'stroke', 'roundRect',
  ]
  methods.forEach((name) => {
    ctx[name] = (...args) => calls.push([name, ...args])
  })
  ctx.measureText = (text) => ({ width: text.length * 10 })
  ctx.createLinearGradient = (...args) => {
    calls.push(['createLinearGradient', ...args])
    return GRADIENT
  }
  ;['fillStyle', 'strokeStyle', 'font', 'textAlign', 'lineWidth'].forEach((name) => {
    Object.defineProperty(ctx, name, {
      set: (value) => {
        calls.push([`set ${name}`, value])
      },
    })
  })
  return { ctx, calls }
}

function record(draw, time) {
  const { ctx, calls } = createRecordingContext()
  draw(ctx, time, 1024, 368, true)
  return calls
}

describe('reduced motion (complete = true)', () => {
  const screens = { drawCode, drawTerminal, drawDashboard }

  Object.entries(screens).forEach(([name, draw]) => {
    it(`${name} draws the same frame at any time`, () => {
      const base = record(draw, 0)
      expect(base.length).toBeGreaterThan(0)
      expect(record(draw, 0.6)).toEqual(base)
      expect(record(draw, 3.3)).toEqual(base)
    })
  })
})

describe('DASHBOARD_LABELS', () => {
  it('has the same keys in every language', () => {
    expect(Object.keys(DASHBOARD_LABELS.es)).toEqual(Object.keys(DASHBOARD_LABELS.en))
  })
})
