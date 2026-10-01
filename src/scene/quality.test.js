import { describe, expect, it, vi } from 'vitest'
import { detectTier, hasWebGL, TIER_SETTINGS } from './quality'

const desktop = { webgl: true, cores: 8, memory: 8, width: 1440, saveData: false, forced: null }

describe('detectTier', () => {
  it('uses the full scene on a capable desktop', () => {
    expect(detectTier(desktop)).toBe('high')
  })

  it('falls back to the static scene without WebGL', () => {
    expect(detectTier({ ...desktop, webgl: false })).toBe('static')
  })

  it('respects data saver', () => {
    expect(detectTier({ ...desktop, saveData: true })).toBe('static')
  })

  it('lowers quality on weak desktops', () => {
    expect(detectTier({ ...desktop, cores: 4 })).toBe('medium')
    expect(detectTier({ ...desktop, memory: 4 })).toBe('medium')
  })

  it('uses the light scene on capable phones and the static one on weak phones', () => {
    expect(detectTier({ ...desktop, width: 390 })).toBe('low')
    expect(detectTier({ ...desktop, width: 390, memory: 3 })).toBe('static')
  })

  it('honours a valid ?scene= override and ignores invalid ones', () => {
    expect(detectTier({ ...desktop, forced: 'static' })).toBe('static')
    expect(detectTier({ ...desktop, webgl: false, forced: 'high' })).toBe('static')
    expect(detectTier({ ...desktop, forced: 'ultra' })).toBe('high')
  })

  it('defines settings for every live tier', () => {
    expect(Object.keys(TIER_SETTINGS)).toEqual(['high', 'medium', 'low'])
  })
})

describe('hasWebGL', () => {
  it('releases the probe context after detecting support', () => {
    const loseContext = vi.fn()
    const gl = { getExtension: vi.fn(() => ({ loseContext })) }
    const spy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(gl)
    try {
      expect(hasWebGL()).toBe(true)
      expect(gl.getExtension).toHaveBeenCalledWith('WEBGL_lose_context')
      expect(loseContext).toHaveBeenCalled()
    } finally {
      spy.mockRestore()
    }
  })

  it('reports false when no context is available', () => {
    const spy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
    try {
      expect(hasWebGL()).toBe(false)
    } finally {
      spy.mockRestore()
    }
  })
})
