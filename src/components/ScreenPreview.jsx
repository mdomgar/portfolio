import { useEffect, useRef } from 'react'
import { SCREENS } from '../lib/screens'
import { useLang, useT } from '../i18n/useLang'
import './css/ScreenPreview.css'

export default function ScreenPreview({ screen, reducedMotion, className = '' }) {
  const lang = useLang()
  const t = useT()
  const ref = useRef(null)
  const { width, height, altKey } = SCREENS[screen]

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined
    const { draw } = SCREENS[screen]
    if (reducedMotion) {
      draw(ctx, 0, canvas.width, canvas.height, true, lang)
      return undefined
    }
    let frame = 0
    let visible = false
    const start = performance.now()
    const loop = (now) => {
      if (!visible) return
      draw(ctx, (now - start) / 1000, canvas.width, canvas.height, false, lang)
      frame = requestAnimationFrame(loop)
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      cancelAnimationFrame(frame)
      if (visible) frame = requestAnimationFrame(loop)
    })
    observer.observe(canvas)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [screen, reducedMotion, lang])

  return (
    <canvas
      ref={ref}
      className={`screen-preview screen-preview--${screen} ${className}`.trim()}
      width={width}
      height={height}
      role="img"
      aria-label={t(altKey)}
    />
  )
}
