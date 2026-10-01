const ORBITS = [0, Math.PI / 3, -Math.PI / 3]

export default function Tower() {
  return (
    <group position={[1.45, 0, -0.15]}>
      <mesh position={[0, 0.24, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.22, 0.48, 0.46]} />
        <meshStandardMaterial color="#10131c" metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.24, 0.231]}>
        <boxGeometry args={[0.012, 0.4, 0.002]} />
        <meshBasicMaterial color="#7c5cff" toneMapped={false} />
      </mesh>
      <group position={[0, 0.34, 0.232]}>
        {ORBITS.map((angle) => (
          <mesh key={angle} rotation={[0, 0, angle]} scale={[1, 0.38, 1]}>
            <torusGeometry args={[0.05, 0.004, 8, 48]} />
            <meshBasicMaterial color="#61dafb" toneMapped={false} />
          </mesh>
        ))}
        <mesh>
          <sphereGeometry args={[0.009, 12, 12]} />
          <meshBasicMaterial color="#61dafb" toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}
