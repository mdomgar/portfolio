import { useEffect } from 'react'

const MAX_TILT_DEG = 6

export function useMicroInteractions(enabled) {
  useEffect(() => {
    if (!enabled || window.matchMedia('(pointer: coarse)').matches) return undefined
    let magnet = null
    let tilted = null

    const release = () => {
      if (magnet) magnet.style.translate = ''
      if (tilted) tilted.style.rotate = ''
      magnet = null
      tilted = null
    }

    const onMove = (event) => {
      const target = event.target instanceof Element ? event.target : null
      const card = target?.closest('.card')
      const button = target?.closest('.btn')
      const tilt = target?.closest('[data-tilt]')

      if (magnet && magnet !== button) {
        magnet.style.translate = ''
        magnet = null
      }
      if (tilted && tilted !== tilt) {
        tilted.style.rotate = ''
        tilted = null
      }

      if (card) {
        const rect = card.getBoundingClientRect()
        card.style.setProperty('--mx', `${event.clientX - rect.left}px`)
        card.style.setProperty('--my', `${event.clientY - rect.top}px`)
      }

      if (button) {
        const rect = button.getBoundingClientRect()
        const dx = (event.clientX - (rect.left + rect.width / 2)) * 0.25
        const dy = (event.clientY - (rect.top + rect.height / 2)) * 0.35
        button.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`
        magnet = button
      }

      if (tilt) {
        const rect = tilt.getBoundingClientRect()
        const nx = rect.width ? (event.clientX - rect.left) / rect.width - 0.5 : 0
        const ny = rect.height ? (event.clientY - rect.top) / rect.height - 0.5 : 0
        const angle = Math.min(1, Math.hypot(nx, ny) * 2) * MAX_TILT_DEG
        tilt.style.rotate = `${(-ny).toFixed(3)} ${nx.toFixed(3)} 0 ${angle.toFixed(2)}deg`
        tilted = tilt
      }
    }

    document.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', release)
    return () => {
      document.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', release)
      release()
    }
  }, [enabled])
}
