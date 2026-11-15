import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createFrameLoader } from './frameLoader'

// A controllable Image: nothing loads until the test says so.
let images
class FakeImage {
  constructor() {
    this.complete = false
    images.push(this)
  }

  set src(value) {
    this._src = value
  }

  get src() {
    return this._src
  }

  load() {
    this.complete = true
    this.naturalWidth = 10
    this.onload?.()
  }

  fail() {
    this.onerror?.()
  }
}

const urls = Array.from({ length: 50 }, (_, i) => `/f/${i + 1}.webp`)
const byUrl = (url) => images.find((img) => img.src === url)

beforeEach(() => {
  images = []
  vi.stubGlobal('Image', FakeImage)
  vi.stubGlobal('requestIdleCallback', (cb) => setTimeout(cb, 0))
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('createFrameLoader', () => {
  it('returns null until something has loaded', () => {
    const loader = createFrameLoader({ urls })
    loader.load()
    expect(loader.nearestLoaded(10)).toBeNull()
  })

  it('returns frame 1 when only frame 1 has loaded', () => {
    const loader = createFrameLoader({ urls })
    loader.load()
    byUrl(urls[0]).load()
    expect(loader.nearestLoaded(40)).toBe(byUrl(urls[0]))
  })

  it('returns the nearest loaded frame (1, 20 and 38 loaded, asking for 40 gives 38)', async () => {
    const loader = createFrameLoader({ urls })
    loader.load()
    byUrl(urls[0]).load()
    await vi.runAllTimersAsync()
    byUrl(urls[19]).load()
    byUrl(urls[37]).load()
    expect(loader.nearestLoaded(40)).toBe(byUrl(urls[37]))
    expect(loader.nearestLoaded(25)).toBe(byUrl(urls[19]))
    expect(loader.nearestLoaded(1)).toBe(byUrl(urls[0]))
  })

  it('skips a frame that errors and never returns it', async () => {
    const loader = createFrameLoader({ urls })
    loader.load()
    byUrl(urls[0]).load()
    await vi.runAllTimersAsync()
    byUrl(urls[10]).fail()
    byUrl(urls[11]).load()
    expect(loader.nearestLoaded(11)).toBe(byUrl(urls[11]))
    expect(loader.nearestLoaded(11)).not.toBe(byUrl(urls[10]))
  })

  it('loads the first frame eagerly and the rest later, in order', async () => {
    const loader = createFrameLoader({ urls })
    loader.load()
    expect(images.map((img) => img.src)).toEqual([urls[0]])
    byUrl(urls[0]).load()
    await vi.runAllTimersAsync()
    const requested = images.map((img) => img.src)
    expect(requested.slice(0, 4)).toEqual(urls.slice(0, 4))
    expect(requested).toEqual(urls.slice(0, requested.length))
  })

  it('does not request anything twice', () => {
    const loader = createFrameLoader({ urls })
    loader.load()
    loader.load()
    expect(images).toHaveLength(1)
  })
})
