import { DESK } from './layout'

const WOOD = '#2a1d16'
const METAL = '#1d2230'
const LEG_X = DESK.width / 2 - 0.08
const LEG_Z = DESK.depth / 2 - 0.08
const LEG_HEIGHT = DESK.height - DESK.top
const LEGS = [
  [-LEG_X, -LEG_Z],
  [LEG_X, -LEG_Z],
  [-LEG_X, LEG_Z],
  [LEG_X, LEG_Z],
]

export default function Desk() {
  return (
    <group>
      <mesh position={[0, DESK.height - DESK.top / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[DESK.width, DESK.top, DESK.depth]} />
        <meshStandardMaterial color={WOOD} roughness={0.7} />
      </mesh>
      {LEGS.map(([x, z]) => (
        <mesh key={`${x}:${z}`} position={[x, LEG_HEIGHT / 2, z]} castShadow>
          <boxGeometry args={[0.05, LEG_HEIGHT, 0.05]} />
          <meshStandardMaterial color={METAL} metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[-0.6, LEG_HEIGHT - 0.01, DESK.depth / 2 - 0.02]}>
        <boxGeometry args={[1.2, 0.012, 0.012]} />
        <meshBasicMaterial color="#00e5ff" toneMapped={false} />
      </mesh>
      <mesh position={[0.6, LEG_HEIGHT - 0.01, DESK.depth / 2 - 0.02]}>
        <boxGeometry args={[1.2, 0.012, 0.012]} />
        <meshBasicMaterial color="#7c5cff" toneMapped={false} />
      </mesh>
    </group>
  )
}
