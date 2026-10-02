import { describe, expect, it } from 'vitest'
import { drawCode, tokenizeLine, typedLines } from './code'
import { drawTerminal } from './terminal'
import { DASHBOARD_LABELS, drawDashboard } from './dashboard'
import { energyUntil, solarPower } from './solar'
import { BUILD_STEPS, drawSiteBuild, SITE_BUILD_LABELS, stepFraction, typedText } from './siteBuild'
import { drawSeenat, pulseAt, SEENAT_LABELS } from './seenat'
import { SCREENS } from './index'
import { fillRound } from './drawUtils'
import { strings } from '../../i18n/strings'

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
  const screens = { drawCode, drawTerminal, drawDashboard, drawSiteBuild, drawSeenat }

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

describe('site-build screen', () => {
  it('types text progressively and never overflows', () => {
    expect(typedText('Hola', 0)).toBe('')
    expect(typedText('Hola', 0.5)).toBe('Ho')
    expect(typedText('Hola', 1)).toBe('Hola')
    expect(typedText('Hola', 3)).toBe('Hola')
  })

  it('reveals the blocks one after another and completes at the end', () => {
    for (let index = 0; index < BUILD_STEPS.length; index += 1) {
      expect(stepFraction(0, index)).toBe(0)
      expect(stepFraction(1, index)).toBe(1)
    }
    expect(stepFraction(0.3, 0)).toBeGreaterThan(stepFraction(0.3, 3))
    for (let p = 0; p < 1; p += 0.1) expect(stepFraction(p + 0.1, 2)).toBeGreaterThanOrEqual(stepFraction(p, 2))
  })

  it('draws the whole page, headline included, on the static frame', () => {
    const { ctx, calls } = createRecordingContext()
    drawSiteBuild(ctx, 0, 1024, 368, true)
    expect(calls).toContainEqual(['fillText', SITE_BUILD_LABELS.es.headline, expect.any(Number), expect.any(Number)])
  })
})

describe('seenat screen', () => {
  it('pulses between 0 and 1 and freezes when complete', () => {
    for (const t of [0, 0.4, 1.3, 7.9]) {
      expect(pulseAt(t, false)).toBeGreaterThanOrEqual(0)
      expect(pulseAt(t, false)).toBeLessThan(1)
    }
    expect(pulseAt(3.3, true)).toBe(pulseAt(0, true))
  })

  it('shows the bubble and the Instagram button', () => {
    const { ctx, calls } = createRecordingContext()
    drawSeenat(ctx, 0, 360, 720, true)
    const texts = calls.filter((call) => call[0] === 'fillText').map((call) => call[1])
    expect(texts).toContain(SEENAT_LABELS.es.bubble)
    expect(texts).toContain(SEENAT_LABELS.es.request)
  })
})

describe('screen registry', () => {
  it('describes every screen with a size and a draw function', () => {
    expect(Object.keys(SCREENS)).toEqual(['code', 'dashboard', 'site-build', 'seenat'])
    for (const screen of Object.values(SCREENS)) {
      expect(screen.width).toBeGreaterThan(0)
      expect(screen.height).toBeGreaterThan(0)
      expect(typeof screen.draw).toBe('function')
    }
  })

  it('has alt text in both languages for every previewable screen', () => {
    for (const id of ['dashboard', 'site-build', 'seenat']) {
      const text = strings[SCREENS[id].altKey]
      expect(text?.es, id).toBeTruthy()
      expect(text?.en, id).toBeTruthy()
    }
  })

  it('keeps the same label keys in every language', () => {
    expect(Object.keys(SITE_BUILD_LABELS.es)).toEqual(Object.keys(SITE_BUILD_LABELS.en))
    expect(Object.keys(SEENAT_LABELS.es)).toEqual(Object.keys(SEENAT_LABELS.en))
  })
})

describe('drawUtils', () => {
  it('fillRound draws a rounded rectangle using canvas methods in order', () => {
    const { ctx, calls } = createRecordingContext()
    fillRound(ctx, 10, 20, 100, 50, 5)
    expect(calls).toContainEqual(['beginPath'])
    expect(calls).toContainEqual(['roundRect', 10, 20, 100, 50, 5])
    expect(calls).toContainEqual(['fill'])
    const beginIdx = calls.findIndex((c) => c[0] === 'beginPath')
    const roundIdx = calls.findIndex((c) => c[0] === 'roundRect')
    const fillIdx = calls.findIndex((c) => c[0] === 'fill')
    expect(beginIdx < roundIdx).toBe(true)
    expect(roundIdx < fillIdx).toBe(true)
  })
})
