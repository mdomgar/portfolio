import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ScreenPreview from './ScreenPreview'
import { DASHBOARD_LABELS } from '../lib/screens/dashboard'

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
    render(<ScreenPreview screen="dashboard" reducedMotion />)
    const canvas = screen.getByRole('img', { name: /panel de SolarMetrics/ })
    expect(canvas).toHaveAttribute('width', '1024')
    expect(canvas).toHaveAttribute('height', '368')
  })

  it('draws the finished frame straight away when motion is reduced', () => {
    const ctx = fakeContext()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx)
    render(<ScreenPreview screen="dashboard" reducedMotion />)
    expect(ctx.fillText).toHaveBeenCalledWith(DASHBOARD_LABELS.es.site, expect.any(Number), expect.any(Number))
  })
})
