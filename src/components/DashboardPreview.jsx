import { useEffect, useRef } from 'react'
import { DASHBOARD_LABELS, drawDashboard } from '../scene/screens/dashboard'
import { useLang, useT } from '../i18n/useLang'

export default function DashboardPreview({ reducedMotion }) {
  const lang = useLang()
  const t = useT()
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined
    const labels = DASHBOARD_LABELS[lang]
    if (reducedMotion) {
      drawDashboard(ctx, 0, canvas.width, canvas.height, true, labels)
      return undefined
    }
    let frame = 0
    let visible = false
    const start = performance.now()
    const loop = (now) => {
      if (!visible) return
      drawDashboard(ctx, (now - start) / 1000, canvas.width, canvas.height, false, labels)
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
  }, [reducedMotion, lang])

  return <canvas ref={ref} className="dashboard-preview" width={1024} height={368} role="img" aria-label={t('dashboardAlt')} />
}
