import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ScreenPreview from './ScreenPreview'
import { SITE_BUILD_LABELS } from '../scene/screens/siteBuild'

function fakeContext() {
  const base = { measureText: (text) => ({ width: text.length * 10 }), createLinearGradient: () => ({ addColorStop() {} }) }
  return new Proxy(base, {
    get(target, key) {
      if (!(key in target)) target[key] = vi.fn()
      return target[key]
    },
  })
}

afterEach(() => vi.restoreAllMocks())

describe('ScreenPreview', () => {
  it('renders an accessible canvas sized for the screen', () => {
    render(<ScreenPreview screen="seenat" reducedMotion />)
    const canvas = screen.getByRole('img', { name: /Interfaz de Seenat/ })
    expect(canvas).toHaveAttribute('width', '360')
    expect(canvas).toHaveAttribute('height', '720')
  })

  it('draws the finished frame straight away when motion is reduced', () => {
    const ctx = fakeContext()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx)
    render(<ScreenPreview screen="site-build" reducedMotion />)
    expect(ctx.fillText).toHaveBeenCalledWith(SITE_BUILD_LABELS.es.headline, expect.any(Number), expect.any(Number))
  })
})
