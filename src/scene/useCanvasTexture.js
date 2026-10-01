import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, SRGBColorSpace } from 'three'

export function useCanvasTexture({ width, height, fps = 20, draw }) {
  const canvas = useMemo(() => {
    const element = document.createElement('canvas')
    element.width = width
    element.height = height
    return element
  }, [width, height])

  const texture = useMemo(() => {
    const tex = new CanvasTexture(canvas)
    tex.colorSpace = SRGBColorSpace
    tex.anisotropy = 4
    return tex
  }, [canvas])

  const drawRef = useRef(draw)
  const elapsed = useRef(Infinity)

  useLayoutEffect(() => {
    drawRef.current = draw
  }, [draw])

  useEffect(() => () => texture.dispose(), [texture])

  useFrame((state, delta) => {
    elapsed.current += delta
    if (elapsed.current < 1 / fps) return
    elapsed.current = 0
    drawRef.current(canvas.getContext('2d'), state.clock.elapsedTime, width, height)
    texture.needsUpdate = true
  })

  return texture
}
