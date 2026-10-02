import { useEffect, useLayoutEffect, useState } from 'react'

export const HERO_MOMENTS_MS = [0, 1700, 3400, 5100]
export const FINAL_MOMENT = 4
export const HERO_SEEN_KEY = 'mdg:hero-seen'

const SKIP_EVENTS = ['wheel', 'touchstart', 'pointerdown', 'keydown', 'scroll']

function readSeen() {
  try {
    return window.sessionStorage.getItem(HERO_SEEN_KEY) === '1'
  } catch {
    return false
  }
}

function writeSeen() {
  try {
    window.sessionStorage.setItem(HERO_SEEN_KEY, '1')
  } catch {
    // Storage blocked: the intro simply plays again next time.
  }
}

export function useHeroSequence({ running, reducedMotion }) {
  const [moment, setMoment] = useState(1)
  const [instant, setInstant] = useState(false)
  const done = moment === FINAL_MOMENT

  // Layout effect: decided before the first paint, and only in the browser (prerender shows moment 1).
  useLayoutEffect(() => {
    if (reducedMotion || readSeen()) setMoment(FINAL_MOMENT)
  }, [reducedMotion])

  useEffect(() => {
    if (!running || done) return undefined
    const id = setTimeout(
      () => setMoment((current) => Math.min(FINAL_MOMENT, current + 1)),
      HERO_MOMENTS_MS[moment] - HERO_MOMENTS_MS[moment - 1],
    )
    return () => clearTimeout(id)
  }, [running, done, moment])

  useEffect(() => {
    if (!running || done) return undefined
    const skip = (event) => {
      // Keyboard actions never animate (spec §7).
      setInstant(event.type === 'keydown')
      setMoment(FINAL_MOMENT)
    }
    SKIP_EVENTS.forEach((type) => window.addEventListener(type, skip, { passive: true }))
    return () => SKIP_EVENTS.forEach((type) => window.removeEventListener(type, skip))
  }, [running, done])

  useEffect(() => {
    if (done) writeSeen()
  }, [done])

  return { moment, instant }
}
