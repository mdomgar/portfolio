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
  vi.useFakeTimers()
  vi.stubGlobal('requestIdleCallback', (cb) => setTimeout(cb, 0))
  vi.stubGlobal('cancelIdleCallback', (id) => clearTimeout(id))
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

  it('dispose stops further requests, abandons in-flight images and releases frames', async () => {
    const loader = createFrameLoader({ urls })
    loader.load()
    byUrl(urls[0]).load()
    expect(loader.nearestLoaded(1)).not.toBeNull()
    loader.dispose()
    const requested = images.length
    await vi.runAllTimersAsync()
    expect(images).toHaveLength(requested)
    expect(loader.nearestLoaded(1)).toBeNull()
  })

  it('dispose before the idle chunk runs requests nothing more', async () => {
    const loader = createFrameLoader({ urls })
    loader.load()
    loader.dispose()
    await vi.runAllTimersAsync()
    expect(images).toHaveLength(1)
    expect(images[0].src).toBe('')
    images[0].load()
    expect(loader.nearestLoaded(1)).toBeNull()
  })

  describe('with a window', () => {
    const windowed = () => createFrameLoader({ urls, window: { behind: 2, ahead: 4 } })

    it('only requests frames around the one on show', async () => {
      const loader = windowed()
      loader.load()
      byUrl(urls[0]).load()
      await vi.runAllTimersAsync()
      expect(images.map((img) => img.src)).toEqual(urls.slice(0, 5))
    })

    it('releases frames that fall out of the window and asks for the new ones', async () => {
      const loader = windowed()
      loader.load()
      await vi.runAllTimersAsync()
      images.forEach((img) => img.load())
      expect(loader.nearestLoaded(5)).toBe(byUrl(urls[4]))
      loader.focus(30)
      await vi.runAllTimersAsync()
      // frames 2..5 are gone, only the first (the fallback image) is kept
      expect(loader.nearestLoaded(5)).toBe(byUrl(urls[0]))
      expect(images.map((img) => img.src)).toContain(urls[29])
      expect(images.map((img) => img.src)).toContain(urls[27])
      expect(images.map((img) => img.src)).not.toContain(urls[40])
      byUrl(urls[29]).load()
      expect(loader.nearestLoaded(30)).toBe(byUrl(urls[29]))
    })

    it('fetches a released frame again when the scroll comes back', async () => {
      const loader = windowed()
      loader.load()
      await vi.runAllTimersAsync()
      images.forEach((img) => img.load())
      loader.focus(30)
      await vi.runAllTimersAsync()
      const before = images.filter((img) => img.src === urls[2]).length
      loader.focus(3)
      expect(images.filter((img) => img.src === urls[2]).length).toBe(before + 1)
    })
  })
})
