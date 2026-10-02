import { NOTEBOOK } from '../layout'

export default function Notebook() {
  const [w, d] = NOTEBOOK.size
  return (
    <group position={NOTEBOOK.position} rotation={[0, NOTEBOOK.rotationY, 0]}>
      <mesh position={[0, 0.006, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, 0.012, d]} />
        <meshStandardMaterial color="#e8e2d4" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.0125, 0]} castShadow>
        <boxGeometry args={[w + 0.004, 0.002, d + 0.004]} />
        <meshStandardMaterial color="#2a2350" roughness={0.6} />
      </mesh>
      <mesh position={[w * 0.32, 0.0138, 0]}>
        <boxGeometry args={[0.006, 0.0012, d + 0.006]} />
        <meshBasicMaterial color="#7c5cff" toneMapped={false} />
      </mesh>
      <mesh position={[w / 2 + 0.022, 0.005, 0]} rotation={[Math.PI / 2, 0, 0.1]} castShadow>
        <cylinderGeometry args={[0.004, 0.004, 0.14, 10]} />
        <meshStandardMaterial color="#141824" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  )
}
