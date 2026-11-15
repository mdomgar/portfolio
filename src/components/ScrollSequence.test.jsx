import { act, render } from '@testing-library/react'
import { createRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ScrollSequence from './ScrollSequence'

let loads
class FakeImage {
  constructor() {
    this.naturalWidth = 1600
    this.naturalHeight = 900
    loads.push(this)
  }

  set src(value) {
    this._src = value
    queueMicrotask(() => this.onload?.())
  }

  get src() {
    return this._src
  }

  decode() {
    return Promise.resolve()
  }
}

let drawn
beforeEach(() => {
  loads = []
  drawn = []
  vi.stubGlobal('Image', FakeImage)
  vi.stubGlobal('requestIdleCallback', (cb) => setTimeout(cb, 0))
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  )
  const context = { drawImage: (img) => drawn.push(img._src), clearRect: () => {}, setTransform: () => {} }
  HTMLCanvasElement.prototype.getContext = () => context
})

afterEach(() => vi.unstubAllGlobals())

const flush = () => act(async () => {
  await new Promise((resolve) => setTimeout(resolve, 5))
})

describe('ScrollSequence', () => {
  it('renders a canvas hidden from assistive technology', () => {
    const { container } = render(<ScrollSequence variant="desktop" progress={0} />)
    const canvas = container.querySelector('canvas')
    expect(canvas).toHaveAttribute('aria-hidden', 'true')
  })

  it('draws the first frame at progress 0 and calls onDraw once something is on the canvas', async () => {
    const onDraw = vi.fn()
    render(<ScrollSequence variant="desktop" progress={0} onDraw={onDraw} />)
    await flush()
    expect(drawn[0]).toBe('/seq/desktop/0001.webp')
    expect(onDraw).toHaveBeenCalledTimes(1)
  })

  it('draws only when the frame index changes', async () => {
    const ref = createRef()
    render(<ScrollSequence ref={ref} variant="desktop" progress={0} />)
    await flush()
    const before = drawn.length
    ref.current.setProgress(0.0001)
    ref.current.setProgress(0.0002)
    expect(drawn.length).toBe(before)
  })

  it('draws the frame for the progress it is given, falling back to the nearest loaded one', async () => {
    const ref = createRef()
    render(<ScrollSequence ref={ref} variant="mobile" progress={0} />)
    await flush()
    ref.current.setProgress(1)
    expect(drawn.at(-1)).toMatch(/\/seq\/mobile\/00\d\d\.webp$/)
  })
})
