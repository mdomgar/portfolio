import { ScrollTrigger } from './gsap'

// A direct load of /#proyectos lands against the static page. Once the pinned stages mount (and add their pin
// spacers) everything after them has moved down, so the target is re-resolved: once per page load, shared by
// every stage, after all of them exist. Only stage mounts during that initial load take part (a later switch
// of reduced motion or viewport must never pull the visitor back), and once the visitor scrolls, or the
// scroll position is no longer where the jump left it, nothing re-jumps.
let session = null

function targetOf() {
  let id = window.location.hash.slice(1)
  try {
    id = decodeURIComponent(id)
  } catch {
    return null
  }
  return id ? document.getElementById(id) : null
}

function createSession() {
  const state = { moved: false, jumpedTo: null, closed: false, pending: 0 }
  const markMoved = () => {
    state.moved = true
  }
  const events = ['wheel', 'touchstart', 'keydown', 'pointerdown']
  events.forEach((name) => window.addEventListener(name, markMoved, { passive: true }))

  const finish = () => {
    state.pending -= 1
    if (state.pending > 0) return
    state.closed = true
    events.forEach((name) => window.removeEventListener(name, markMoved))
  }

  const settle = () => {
    if (state.moved || (state.jumpedTo !== null && Math.abs(window.scrollY - state.jumpedTo) > 2)) return
    ScrollTrigger.refresh()
    const target = targetOf()
    if (!target) return
    const nav = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 64
    window.scrollTo({ top: Math.max(0, target.getBoundingClientRect().top + window.scrollY - nav), behavior: 'instant' })
    state.jumpedTo = window.scrollY
  }

  state.pending = 1
  requestAnimationFrame(() => {
    settle()
    finish()
  })
  if (document.fonts?.ready) {
    state.pending += 1
    document.fonts.ready.then(() => {
      settle()
      finish()
    })
  }
  return state
}

// Call from a pinned stage's effect once its triggers exist. Safe to call from several stages and from later
// mounts (which do nothing).
export function landOnHash() {
  // performance.now() counts from the page load: later mounts (a switch at runtime) are not a landing.
  if (!session && performance.now() < 10000) session = createSession()
}
