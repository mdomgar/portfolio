import { useEffect, useRef, useState } from 'react'
import { formatNumber } from '../lib/format'
import { useLang } from '../i18n/useLang'

export default function CountUp({ value, decimals = 0, suffix = '', reducedMotion, duration = 1600 }) {
  const lang = useLang()
  const ref = useRef(null)
  const [display, setDisplay] = useState(reducedMotion ? value : 0)

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(value)
      return undefined
    }
    let frame = 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        const start = performance.now()
        const step = (now) => {
          const progress = Math.min(1, (now - start) / duration)
          setDisplay(value * (1 - Math.pow(1 - progress, 3)))
          if (progress < 1) frame = requestAnimationFrame(step)
        }
        frame = requestAnimationFrame(step)
      },
      { threshold: 0.6 },
    )
    observer.observe(ref.current)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [value, duration, reducedMotion])

  return (
    <span ref={ref}>
      <span aria-hidden="true">
        {formatNumber(display, decimals, lang)}
        {suffix}
      </span>
      <span className="sr-only">
        {formatNumber(value, decimals, lang)}
        {suffix}
      </span>
    </span>
  )
}
