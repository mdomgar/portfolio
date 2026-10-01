export default function Room() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0b0d14" roughness={0.9} />
      </mesh>
      <mesh position={[0, 3, -1.1]} receiveShadow>
        <planeGeometry args={[12, 6]} />
        <meshStandardMaterial color="#0c0f18" roughness={0.95} />
      </mesh>
    </group>
  )
}
