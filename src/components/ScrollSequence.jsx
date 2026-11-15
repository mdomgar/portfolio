import { useEffect, useImperativeHandle, useRef } from 'react'
import { frameUrl, SEQUENCE } from '../data/sequence'
import { createFrameLoader } from '../lib/frameLoader'

const frameAt = (count, progress) => 1 + Math.round(Math.min(Math.max(progress, 0), 1) * (count - 1))

// A canvas that plays a pre-rendered frame sequence. The frame follows `progress` (0..1), either through
// the prop or imperatively with ref.setProgress(p), which is what a scroll timeline uses so React never
// re-renders per tick. The canvas fills its parent and the frame is drawn "cover"-fit; the backing store
// follows the device pixel ratio but never exceeds the frame's native resolution. It draws only when the
// image to show changes, and never clears to blank: with nothing decoded yet it draws nothing.
export default function ScrollSequence({ variant, progress = 0, onDraw, ref, className }) {
  const canvasRef = useRef(null)
  const live = useRef({ progress, image: null, loader: null, notified: false })
  const onDrawRef = useRef(onDraw)
  onDrawRef.current = onDraw
  const drawRef = useRef(() => {})

  useEffect(() => {
    const spec = SEQUENCE[variant]
    const canvas = canvasRef.current
    const state = live.current
    const loader = createFrameLoader({ urls: Array.from({ length: spec.count }, (_, i) => frameUrl(variant, i + 1)) })
    state.loader = loader
    state.image = null

    const fit = () => {
      const cssW = canvas.clientWidth || spec.width
      const cssH = canvas.clientHeight || spec.height
      const cover = Math.max(cssW / spec.width, cssH / spec.height)
      const ratio = Math.min(window.devicePixelRatio || 1, 1 / cover)
      const width = Math.max(1, Math.round(cssW * ratio))
      const height = Math.max(1, Math.round(cssH * ratio))
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
        return true
      }
      return false
    }

    const draw = (force) => {
      const image = loader.nearestLoaded(frameAt(spec.count, state.progress))
      if (!image || (image === state.image && !force)) return
      const context = canvas.getContext('2d')
      if (!context) return
      const scale = Math.max(canvas.width / spec.width, canvas.height / spec.height)
      const w = spec.width * scale
      const h = spec.height * scale
      context.clearRect(0, 0, canvas.width, canvas.height)
      context.drawImage(image, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h)
      state.image = image
      if (!state.notified) {
        state.notified = true
        onDrawRef.current?.()
      }
    }
    drawRef.current = draw

    fit()
    const unsubscribe = loader.subscribe(() => draw(false))
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(() => fit() && draw(true)) : null
    observer?.observe(canvas)
    loader.load()
    draw(false)

    return () => {
      unsubscribe()
      observer?.disconnect()
      drawRef.current = () => {}
      state.loader = null
      state.image = null
    }
  }, [variant])

  useEffect(() => {
    live.current.progress = progress
    drawRef.current(false)
  }, [progress])

  useImperativeHandle(ref, () => ({
    setProgress(value) {
      live.current.progress = value
      drawRef.current(false)
    },
  }))

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
