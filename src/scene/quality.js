const VALID_TIERS = ['static', 'low', 'medium', 'high']

export const TIER_SETTINGS = {
  high: { dpr: [1, 2], shadows: true, bloom: true, sparkles: 60 },
  medium: { dpr: [1, 1.5], shadows: false, bloom: true, sparkles: 40 },
  low: { dpr: 1, shadows: false, bloom: false, sparkles: 20 },
}

export function hasWebGL() {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    // Free the probe context right away; browsers cap live WebGL contexts per page.
    gl?.getExtension?.('WEBGL_lose_context')?.loseContext()
    return Boolean(gl)
  } catch {
    return false
  }
}

export function readDeviceInfo() {
  const nav = window.navigator
  return {
    webgl: hasWebGL(),
    cores: nav.hardwareConcurrency ?? 4,
    memory: nav.deviceMemory ?? 8,
    width: window.innerWidth,
    saveData: Boolean(nav.connection?.saveData),
    forced: new URLSearchParams(window.location.search).get('scene'),
  }
}

export function detectTier({ webgl, cores, memory, width, saveData, forced }) {
  if (!webgl) return 'static'
  if (VALID_TIERS.includes(forced)) return forced
  if (saveData) return 'static'
  const weak = cores <= 4 || memory <= 4
  if (width < 768) return weak ? 'static' : 'low'
  return weak ? 'medium' : 'high'
}
