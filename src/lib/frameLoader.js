// Loads the frames of a pre-rendered sequence: the first one eagerly, the rest in idle time, in order.
// Frames are HTMLImageElements (decoded off the main thread with img.decode() when the browser has it),
// so drawing one later is cheap. A frame that fails to load is simply never returned.

const CHUNK = 8

const whenIdle = (callback) =>
  typeof requestIdleCallback === 'function' ? requestIdleCallback(callback, { timeout: 400 }) : setTimeout(callback, 60)

export function createFrameLoader({ urls }) {
  const frames = new Array(urls.length).fill(null)
  const listeners = new Set()
  let started = false
  let next = 1

  function ready(index, img) {
    frames[index] = img
    listeners.forEach((listener) => listener(index + 1))
  }

  function request(index) {
    const img = new Image()
    let done = false
    const settle = (ok) => {
      if (done) return
      done = true
      if (ok) ready(index, img)
    }
    img.onload = () => {
      if (typeof img.decode === 'function') img.decode().then(() => settle(true), () => settle(true))
      else settle(true)
    }
    img.onerror = () => settle(false)
    img.src = urls[index]
  }

  function queueRest() {
    // The rest is requested in idle chunks: the browser keeps request order, nothing waits on a load.
    whenIdle(() => {
      for (let n = 0; n < CHUNK && next < urls.length; n += 1) {
        request(next)
        next += 1
      }
      if (next < urls.length) queueRest()
    })
  }

  return {
    load() {
      if (started || urls.length === 0) return
      started = true
      request(0)
      next = 1
      queueRest()
    },
    // The loaded frame closest to `index` (1-based), the earlier one on a tie; null when none has loaded.
    nearestLoaded(index) {
      const target = Math.min(Math.max(Math.round(index), 1), urls.length) - 1
      for (let distance = 0; distance < urls.length; distance += 1) {
        const before = frames[target - distance]
        if (before) return before
        const after = frames[target + distance]
        if (after) return after
      }
      return null
    },
    // Calls back with the 1-based index of every frame that becomes available; returns an unsubscribe.
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}
