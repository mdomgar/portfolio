import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { DESK_TOP } from '../layout'

const CERAMIC = '#e8ecf4'

export default function Mug({ reducedMotion }) {
  const [hovered, setHovered] = useState(false)
  const puffs = useRef([])

  useFrame(({ clock }) => {
    const speed = hovered ? 2.2 : 1
    puffs.current.forEach((puff, index) => {
      if (!puff) return
      const t = reducedMotion ? 0.5 : (clock.elapsedTime * 0.35 * speed + index / 3) % 1
      puff.position.set(Math.sin(t * 6 + index) * 0.015, 0.11 + t * 0.22, 0)
      puff.scale.setScalar(0.6 + t * 0.9)
      puff.material.opacity = (1 - t) * (hovered ? 0.35 : 0.18)
    })
  })

  return (
    <group
      position={[-0.72, DESK_TOP, 0.12]}
      onPointerOver={(event) => {
        event.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.035, 0.1, 24]} />
        <meshStandardMaterial color={CERAMIC} roughness={0.35} />
      </mesh>
      <mesh position={[0.045, 0.05, 0]}>
        <torusGeometry args={[0.022, 0.007, 10, 20]} />
        <meshStandardMaterial color={CERAMIC} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.098, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.036, 24]} />
        <meshStandardMaterial color="#3b2416" roughness={0.2} />
      </mesh>
      {[0, 1, 2].map((index) => (
        <mesh
          key={index}
          ref={(mesh) => {
            puffs.current[index] = mesh
          }}
        >
          <sphereGeometry args={[0.02, 10, 10]} />
          <meshBasicMaterial color="#cfd8e6" transparent opacity={0.18} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}
