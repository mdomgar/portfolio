import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '../lib/gsap'

export function useSmoothScroll(enabled) {
  useEffect(() => {
    if (!enabled) return undefined
    const offset = -parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || -72
    const lenis = new Lenis({ anchors: { offset }, lerp: 0.1 })
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [enabled])
}
