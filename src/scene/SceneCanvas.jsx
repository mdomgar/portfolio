import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { useSceneStore } from '../store/sceneStore'
import { getPose } from './cameraPoses'
import { TIER_SETTINGS } from './quality'
import CameraRig from './CameraRig'
import Lights from './Lights'
import Room from './Room'
import Desk from './Desk'
import Monitors from './Monitors'
import Effects from './Effects'

export default function SceneCanvas({ tier, reducedMotion }) {
  const settings = TIER_SETTINGS[tier]
  const downgrade = useSceneStore((state) => state.downgrade)
  const setTier = useSceneStore((state) => state.setTier)

  const handleCreated = ({ gl }) => {
    gl.domElement.addEventListener(
      'webglcontextlost',
      (event) => {
        event.preventDefault()
        setTier('static')
      },
      { once: true },
    )
  }

  return (
    <Canvas
      className="scene-canvas"
      dpr={settings.dpr}
      shadows={settings.shadows}
      camera={{ position: getPose('hero').position, fov: 40, near: 0.1, far: 50 }}
      gl={{ antialias: tier !== 'low', powerPreference: 'high-performance' }}
      eventSource={document.getElementById('root')}
      eventPrefix="client"
      onCreated={handleCreated}
    >
      <color attach="background" args={['#07080d']} />
      <fog attach="fog" args={['#07080d', 5, 13]} />
      <PerformanceMonitor onDecline={downgrade} />
      <CameraRig reducedMotion={reducedMotion} />
      <Lights shadows={settings.shadows} />
      <Room />
      <Desk />
      <Monitors reducedMotion={reducedMotion} />
      {settings.bloom && <Effects />}
    </Canvas>
  )
}
