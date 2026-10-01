import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { Color, Object3D } from 'three'
import { DESK_TOP } from './layout'

const COLS = 15
const ROWS = 5
const KEY = 0.024
const GAP = 0.004
const PITCH = KEY + GAP

export default function Keyboard({ reducedMotion }) {
  const keys = useRef(null)
  const [hovered, setHovered] = useState(false)
  const color = useMemo(() => new Color(), [])

  useLayoutEffect(() => {
    const dummy = new Object3D()
    let i = 0
    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLS; col += 1) {
        dummy.position.set((col - (COLS - 1) / 2) * PITCH, 0, (row - (ROWS - 1) / 2) * PITCH)
        dummy.updateMatrix()
        keys.current.setMatrixAt(i, dummy.matrix)
        keys.current.setColorAt(i, color.set('#00e5ff'))
        i += 1
      }
    }
    keys.current.instanceMatrix.needsUpdate = true
    keys.current.instanceColor.needsUpdate = true
  }, [color])

  useFrame(({ clock }) => {
    const t = reducedMotion ? 0 : clock.elapsedTime
    let i = 0
    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLS; col += 1) {
        const hue = hovered
          ? (t * 0.4 + col / COLS + row * 0.05) % 1
          : 0.5 + 0.22 * (0.5 + 0.5 * Math.sin(t * 2 - col * 0.45))
        keys.current.setColorAt(i, color.setHSL(hue, 1, 0.55))
        i += 1
      }
    }
    keys.current.instanceColor.needsUpdate = true
  })

  return (
    <group
      position={[0, DESK_TOP + 0.012, 0.16]}
      onPointerOver={(event) => {
        event.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh position={[0.1, -0.0105, 0.02]} receiveShadow>
        <boxGeometry args={[0.9, 0.003, 0.34]} />
        <meshStandardMaterial color="#0e1119" roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.006, 0]} castShadow>
        <boxGeometry args={[COLS * PITCH + 0.02, 0.014, ROWS * PITCH + 0.02]} />
        <meshStandardMaterial color="#141824" roughness={0.5} />
      </mesh>
      <instancedMesh ref={keys} args={[undefined, undefined, COLS * ROWS]}>
        <boxGeometry args={[KEY, 0.01, KEY]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <RoundedBox args={[0.06, 0.022, 0.1]} radius={0.01} position={[0.34, -0.004, 0.02]} castShadow>
        <meshStandardMaterial color="#141824" roughness={0.4} />
      </RoundedBox>
    </group>
  )
}
