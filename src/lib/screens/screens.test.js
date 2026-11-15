import { describe, expect, it } from 'vitest'
import { DASHBOARD_LABELS, drawDashboard } from './dashboard'
import { energyUntil, solarPower } from './solar'
import { SCREENS } from './index'
import { fillRound } from './drawUtils'
import { strings } from '../../i18n/strings'

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
  const methods = ['fillRect', 'fillText', 'beginPath', 'arc', 'fill', 'moveTo', 'lineTo', 'closePath', 'stroke', 'roundRect']
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

describe('dashboard screen', () => {
  it('draws the same frame at any time when motion is reduced', () => {
    const base = record(drawDashboard, 0)
    expect(base.length).toBeGreaterThan(0)
    expect(record(drawDashboard, 0.6)).toEqual(base)
    expect(record(drawDashboard, 3.3)).toEqual(base)
  })

  it('has the same label keys in every language', () => {
    expect(Object.keys(DASHBOARD_LABELS.es)).toEqual(Object.keys(DASHBOARD_LABELS.en))
  })
})

describe('screen registry', () => {
  it('describes the dashboard with a size and a draw function', () => {
    expect(Object.keys(SCREENS)).toEqual(['dashboard'])
    expect(SCREENS.dashboard.width).toBeGreaterThan(0)
    expect(SCREENS.dashboard.height).toBeGreaterThan(0)
    expect(typeof SCREENS.dashboard.draw).toBe('function')
  })

  it('has alt text in both languages', () => {
    const text = strings[SCREENS.dashboard.altKey]
    expect(text?.es).toBeTruthy()
    expect(text?.en).toBeTruthy()
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
