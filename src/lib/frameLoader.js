// Loads the frames of a pre-rendered sequence: the first one eagerly, the rest in idle time, in order.
// Frames are HTMLImageElements decoded off the main thread with img.decode() when the browser has it, so
// drawing one later is cheap. A frame that fails to load is simply never returned.
//
// Decoded frames are big (a 1600x900 frame is 5.7 MB of pixels), so a loader can be given a `window`
// ({ behind, ahead }, in frames): only the frames around the one being shown are kept, the others are
// released and fetched again (from the HTTP cache) when the scroll comes back to them. Without a window every
// frame is kept. (ImageBitmaps were tried for the window and measured worse: they are decoded eagerly and
// stay resident, while Chrome drops the decoded pixels of idle <img>s by itself.)

const CHUNK = 8

const whenIdle = (callback) =>
  typeof requestIdleCallback === 'function'
    ? { id: requestIdleCallback(callback, { timeout: 400 }), idle: true }
    : { id: setTimeout(callback, 60), idle: false }

const cancelIdle = (handle) => {
  if (!handle) return
  if (handle.idle && typeof cancelIdleCallback === 'function') cancelIdleCallback(handle.id)
  else clearTimeout(handle.id)
}

// Starts loading one frame; calls `done(frame)` once it is ready to draw, or `done(null)` when it failed.
// Returns a function that abandons the load.
function loadFrame(url, done) {
  const img = new Image()
  img.onload = () => {
    if (typeof img.decode === 'function') img.decode().then(() => done(img), () => done(img))
    else done(img)
  }
  img.onerror = () => done(null)
  img.src = url
  return () => {
    img.onload = null
    img.onerror = null
    img.src = ''
  }
}

// Lets go of a frame: emptying src makes the browser drop the image resource and its decoded pixels, which
// merely dropping the reference does not.
function release(frame) {
  frame.src = ''
}

export function createFrameLoader({ urls, window: span = null }) {
  const frames = new Array(urls.length).fill(null)
  // Indices that are loaded or being loaded (and so must not be requested again).
  const requested = new Set()
  const listeners = new Set()
  const inflight = new Map()
  let started = false
  let disposed = false
  let pending = null
  let center = 0

  const wanted = (index) => !span || index === 0 || (index >= center - span.behind && index <= center + span.ahead)

  function ready(index, img) {
    frames[index] = img
    listeners.forEach((listener) => listener(index + 1))
  }

  function request(index) {
    requested.add(index)
    let finished = false
    const cancel = loadFrame(urls[index], (frame) => {
      if (finished) return
      finished = true
      inflight.delete(index)
      if (disposed || !frame) {
        if (frame) release(frame)
        return
      }
      if (wanted(index)) ready(index, frame)
      else {
        release(frame)
        requested.delete(index)
      }
    })
    if (!finished) inflight.set(index, cancel)
  }

  // Requests the missing frames of the window, nearest to the centre first; at most `limit` per call.
  function fill(limit) {
    let count = 0
    const reach = span ? Math.max(span.ahead, span.behind) : urls.length
    for (let distance = 0; distance <= reach && count < limit; distance += 1) {
      for (const index of distance === 0 ? [center] : [center + distance, center - distance]) {
        if (count >= limit) break
        if (index < 0 || index >= urls.length || requested.has(index) || !wanted(index)) continue
        request(index)
        count += 1
      }
    }
    return count
  }

  function queueRest() {
    // The rest is requested in idle chunks: the browser keeps request order, nothing waits on a load.
    pending = whenIdle(() => {
      pending = null
      if (disposed) return
      if (fill(CHUNK) > 0) queueRest()
    })
  }

  return {
    load() {
      if (started || disposed || urls.length === 0) return
      started = true
      request(0)
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
    // The frame being shown (1-based). With a window, releases the frames that fell outside it and asks for
    // the missing ones around it. A no-op without a window.
    focus(index) {
      if (!span || disposed || !started) return
      const next = Math.min(Math.max(Math.round(index), 1), urls.length) - 1
      if (next === center) return
      center = next
      frames.forEach((img, i) => {
        if (img && !wanted(i)) {
          release(img)
          frames[i] = null
          requested.delete(i)
        }
      })
      fill(CHUNK)
    },
    // Stops everything: no more requests, in-flight images are abandoned, decoded frames are released.
    dispose() {
      disposed = true
      cancelIdle(pending)
      pending = null
      inflight.forEach((cancel) => cancel())
      inflight.clear()
      requested.clear()
      frames.forEach((frame) => frame && release(frame))
      frames.fill(null)
      listeners.clear()
    },
    // Calls back with the 1-based index of every frame that becomes available; returns an unsubscribe.
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}
