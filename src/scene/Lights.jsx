import { useState } from 'react'
import { Object3D } from 'three'
import { useSceneStore } from '../store/sceneStore'
import { LAMP_HEAD } from './layout'

export default function Lights({ shadows }) {
  const lampOn = useSceneStore((state) => state.lampOn)
  const [lampTarget] = useState(() => new Object3D())

  return (
    <>
      <ambientLight intensity={0.35} color="#8fa3ff" />
      <hemisphereLight args={['#1b2440', '#07080d', 0.5]} />
      <primitive object={lampTarget} position={[-0.35, 0.75, 0.1]} />
      <spotLight
        position={LAMP_HEAD}
        target={lampTarget}
        angle={0.8}
        penumbra={0.6}
        intensity={lampOn ? 6 : 0}
        distance={4}
        decay={1.5}
        color="#ffb454"
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-0.6, 0.55, 0.45]} color="#00e5ff" intensity={2.2} distance={2.5} />
      <pointLight position={[0.6, 0.55, 0.45]} color="#7c5cff" intensity={2.2} distance={2.5} />
      <pointLight position={[0, 1.12, 0.25]} color="#7fdcff" intensity={1.2} distance={1.8} />
    </>
  )
}
