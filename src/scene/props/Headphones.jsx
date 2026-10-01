import { DESK_TOP } from '../layout'

const DARK = '#141824'

export default function Headphones() {
  return (
    <group position={[0.68, DESK_TOP, -0.3]}>
      <mesh position={[0, 0.006, 0]}>
        <cylinderGeometry args={[0.05, 0.055, 0.012, 24]} />
        <meshStandardMaterial color={DARK} metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.26, 10]} />
        <meshStandardMaterial color={DARK} metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.27, 0]}>
        <torusGeometry args={[0.075, 0.01, 10, 32, Math.PI]} />
        <meshStandardMaterial color={DARK} roughness={0.5} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.075, 0.25, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.035, 0.035, 0.025, 20]} />
            <meshStandardMaterial color={DARK} roughness={0.5} />
          </mesh>
          <mesh position={[side * 0.013, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.03, 0.003, 8, 24]} />
            <meshBasicMaterial color="#00e5ff" toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
