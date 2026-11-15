import { ScrollTrigger } from './gsap'

// A direct load of /#proyectos lands against the static page. Once a pinned stage mounts (and adds its pin
// spacer) everything after it has moved down, so the target is re-resolved once per stage, for anything that
// comes after it. Each stage asks once; later remounts (a path switch) never pull the visitor back.
const landed = new Set()

function resolveAfter(stage) {
  const id = decodeURIComponent(window.location.hash.slice(1))
  const target = id && document.getElementById(id)
  if (!target || !(stage.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING)) return
  if (stage.contains(target)) return
  const nav = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 64
  window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - nav, behavior: 'instant' })
}

// Returns a cleanup. Call it from inside the stage's useGSAP, after its triggers exist.
export function landOnHash(stage, key) {
  let alive = true
  let frame = 0
  const settle = () => {
    ScrollTrigger.refresh()
    resolveAfter(stage)
  }
  if (!landed.has(key)) {
    landed.add(key)
    frame = requestAnimationFrame(() => alive && settle())
    document.fonts?.ready.then(() => alive && settle())
  } else {
    document.fonts?.ready.then(() => alive && ScrollTrigger.refresh())
  }
  return () => {
    alive = false
    cancelAnimationFrame(frame)
  }
}
