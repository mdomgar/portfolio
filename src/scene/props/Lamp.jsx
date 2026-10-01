import { useState } from 'react'
import { Sparkles, useCursor } from '@react-three/drei'
import { DoubleSide } from 'three'
import { useSceneStore } from '../../store/sceneStore'
import { DESK_TOP } from '../layout'

const METAL = '#1d2230'

export default function Lamp({ reducedMotion, sparkles }) {
  const lampOn = useSceneStore((state) => state.lampOn)
  const toggleLamp = useSceneStore((state) => state.toggleLamp)
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  return (
    <group>
      <group
        position={[-0.98, DESK_TOP, -0.22]}
        onClick={(event) => {
          event.stopPropagation()
          toggleLamp()
        }}
        onPointerOver={(event) => {
          event.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={() => setHovered(false)}
      >
        <mesh position={[0, 0.01, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.1, 0.02, 32]} />
          <meshStandardMaterial color={METAL} metalness={0.7} roughness={0.35} />
        </mesh>
        <mesh position={[0.04, 0.23, 0]} rotation={[0, 0, -0.19]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.43, 12]} />
          <meshStandardMaterial color={METAL} metalness={0.7} roughness={0.35} />
        </mesh>
        <mesh position={[0.19, 0.48, 0]} rotation={[0, 0, -1.22]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.234, 12]} />
          <meshStandardMaterial color={METAL} metalness={0.7} roughness={0.35} />
        </mesh>
        <mesh position={[0.34, 0.49, 0]} rotation={[0, 0, Math.PI * 0.8]} castShadow>
          <coneGeometry args={[0.07, 0.1, 24, 1, true]} />
          <meshStandardMaterial color={METAL} metalness={0.7} roughness={0.35} side={DoubleSide} />
        </mesh>
        <mesh position={[0.34, 0.47, 0]}>
          <sphereGeometry args={[0.025, 16, 16]} />
          <meshBasicMaterial color={lampOn ? '#ffd9a0' : '#3a3024'} toneMapped={false} />
        </mesh>
      </group>
      <Sparkles
        count={sparkles}
        scale={[0.6, 0.5, 0.6]}
        position={[-0.5, 1.0, -0.05]}
        size={1.6}
        speed={reducedMotion ? 0 : 0.25}
        opacity={lampOn ? 0.6 : 0.15}
        color="#ffd9a0"
      />
    </group>
  )
}
