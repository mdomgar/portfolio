import { act, render } from '@testing-library/react'
import { createRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ScrollSequence from './ScrollSequence'

let loads
let held
let holdMobile
class FakeImage {
  constructor() {
    this.naturalWidth = 1600
    this.naturalHeight = 900
    loads.push(this)
  }

  set src(value) {
    this._src = value
    if (holdMobile && value.includes('/mobile/')) {
      held.push(this)
      return
    }
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
  held = []
  holdMobile = false
  drawn = []
  vi.stubGlobal('Image', FakeImage)
  vi.stubGlobal('requestIdleCallback', (cb) => setTimeout(cb, 0))
  vi.stubGlobal('cancelIdleCallback', (id) => clearTimeout(id))
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

  it('keeps the old frame (no blank canvas) when the variant switches, until a frame of the new set is ready', async () => {
    const onDraw = vi.fn()
    const { container, rerender } = render(<ScrollSequence variant="desktop" progress={0} onDraw={onDraw} />)
    await flush()
    const canvas = container.querySelector('canvas')
    const size = [canvas.width, canvas.height]
    const clears = []
    const context = canvas.getContext('2d')
    context.clearRect = () => clears.push('clear')
    holdMobile = true
    rerender(<ScrollSequence variant="mobile" progress={0} onDraw={onDraw} />)
    await flush()
    expect([canvas.width, canvas.height]).toEqual(size)
    expect(clears).toHaveLength(0)
    expect(onDraw).toHaveBeenCalledTimes(1)
    holdMobile = false
    held[0].onload()
    await flush()
    expect(drawn.at(-1)).toBe('/seq/mobile/0001.webp')
    expect(onDraw).toHaveBeenCalledTimes(2)
  })

  it('abandons the frames of the old set on unmount', async () => {
    const { unmount } = render(<ScrollSequence variant="desktop" progress={0} />)
    await flush()
    const before = loads.length
    unmount()
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(loads.length).toBe(before)
  })
})
