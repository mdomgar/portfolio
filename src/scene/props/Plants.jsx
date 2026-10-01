import { DESK_TOP } from '../layout'

const LEAVES = [0, 1, 2, 3, 4]
const FOLIAGE = [
  [0, 0.95, 0, 0.22],
  [0.14, 0.85, 0.05, 0.17],
  [-0.13, 0.88, -0.04, 0.18],
  [0.02, 1.08, -0.06, 0.16],
]

export function DeskPlant() {
  return (
    <group position={[1.02, DESK_TOP, 0.26]}>
      <mesh position={[0, 0.045, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.04, 0.09, 20]} />
        <meshStandardMaterial color="#d8d2c4" roughness={0.8} />
      </mesh>
      {LEAVES.map((index) => (
        <mesh
          key={index}
          position={[Math.cos(index * 1.26) * 0.02, 0.13, Math.sin(index * 1.26) * 0.02]}
          rotation={[Math.sin(index * 1.26) * 0.5, 0, -Math.cos(index * 1.26) * 0.5]}
          castShadow
        >
          <coneGeometry args={[0.018, 0.1, 6]} />
          <meshStandardMaterial color="#3f8f5a" roughness={0.6} flatShading />
        </mesh>
      ))}
    </group>
  )
}

export function OliveTree() {
  return (
    <group position={[-1.55, 0, -0.5]}>
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.12, 0.3, 24]} />
        <meshStandardMaterial color="#8a4b2f" roughness={0.85} />
      </mesh>
      <mesh position={[0.02, 0.6, 0]} rotation={[0, 0, -0.08]} castShadow>
        <cylinderGeometry args={[0.025, 0.04, 0.62, 8]} />
        <meshStandardMaterial color="#5b4636" roughness={0.9} flatShading />
      </mesh>
      {FOLIAGE.map(([x, y, z, r]) => (
        <mesh key={`${x}:${y}`} position={[x, y, z]} castShadow>
          <icosahedronGeometry args={[r, 0]} />
          <meshStandardMaterial color="#6b7d3a" roughness={0.8} flatShading />
        </mesh>
      ))}
    </group>
  )
}
