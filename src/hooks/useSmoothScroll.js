import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '../lib/gsap'

function hashTarget() {
  try {
    const id = decodeURIComponent(window.location.hash.slice(1))
    return id ? document.getElementById(id) : null
  } catch {
    return null
  }
}

export function useSmoothScroll(enabled) {
  useEffect(() => {
    if (!enabled) return undefined
    // Lenis already subtracts the target's CSS scroll-margin-top (the navbar height) from an anchor jump.
    // After a glide, if the layout moved under it (pin spacers added late), aim once more with fresh limits.
    const reaim = () => {
      const el = hashTarget()
      if (!el) return
      const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0
      if (Math.abs(el.getBoundingClientRect().top - margin) <= 2) return
      lenis.resize()
      lenis.scrollTo(el, { onComplete: () => {} })
    }
    const lenis = new Lenis({ anchors: { onComplete: reaim }, lerp: 0.1 })
    // Pinned stages add their spacers after Lenis measured the page: keep its scroll limit current.
    const onRefresh = () => lenis.resize()
    ScrollTrigger.addEventListener('refresh', onRefresh)
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      ScrollTrigger.removeEventListener('refresh', onRefresh)
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [enabled])
}
