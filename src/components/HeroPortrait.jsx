import { useEffect, useRef } from 'react'
import { useT } from '../i18n/useLang'

export default function HeroPortrait({ reducedMotion }) {
  const t = useT()
  const ref = useRef(null)

  useEffect(() => {
    if (reducedMotion || window.matchMedia('(pointer: coarse)').matches) return undefined
    let frame = 0
    const onMove = (event) => {
      const x = event.clientX / window.innerWidth - 0.5
      const y = event.clientY / window.innerHeight - 0.5
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        ref.current?.style.setProperty('--px', x.toFixed(3))
        ref.current?.style.setProperty('--py', y.toFixed(3))
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(frame)
    }
  }, [reducedMotion])

  return (
    <div className="hero-portrait" ref={ref}>
      <img
        src="/img/portrait-1086.webp"
        srcSet="/img/portrait-540.webp 540w, /img/portrait-1086.webp 1086w"
        sizes="(max-width: 768px) 78vw, 520px"
        width="1086"
        height="1448"
        alt={t('portraitAlt')}
        fetchPriority="high"
      />
    </div>
  )
}
