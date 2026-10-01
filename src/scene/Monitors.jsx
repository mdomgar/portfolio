import { useSceneStore } from '../store/sceneStore'
import { useLang } from '../i18n/useLang'
import { useCanvasTexture } from './useCanvasTexture'
import { DESK_TOP, MAIN_SCREEN, SIDE_SCREEN } from './layout'
import { drawCode } from './screens/code'
import { drawTerminal } from './screens/terminal'
import { DASHBOARD_LABELS, drawDashboard } from './screens/dashboard'

const BEZEL = '#0d1017'
const STAND = '#1d2230'

function Screen({ size, texture, bezel = 0.02 }) {
  const [w, h] = size
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[w + bezel * 2, h + bezel * 2, 0.03]} />
        <meshStandardMaterial color={BEZEL} roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.016]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  )
}

function Stand({ height, depthOffset = -0.05 }) {
  return (
    <group>
      <mesh position={[0, -height / 2, depthOffset]}>
        <boxGeometry args={[0.05, height, 0.04]} />
        <meshStandardMaterial color={STAND} metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, -height + 0.008, depthOffset]}>
        <boxGeometry args={[0.3, 0.016, 0.18]} />
        <meshStandardMaterial color={STAND} metalness={0.6} roughness={0.35} />
      </mesh>
    </group>
  )
}

export default function Monitors({ reducedMotion }) {
  const lang = useLang()
  const showDashboard = useSceneStore((state) => state.section === 'projects')

  const main = useCanvasTexture({
    width: 1024,
    height: 368,
    fps: 24,
    animate: !reducedMotion,
    draw: (ctx, time, w, h) =>
      showDashboard
        ? drawDashboard(ctx, time, w, h, reducedMotion, DASHBOARD_LABELS[lang])
        : drawCode(ctx, time, w, h, reducedMotion),
  })
  const side = useCanvasTexture({
    width: 384,
    height: 680,
    fps: 8,
    animate: !reducedMotion,
    draw: (ctx, time, w, h) => drawTerminal(ctx, time, w, h, reducedMotion),
  })

  const mainBottom = MAIN_SCREEN.position[1] - MAIN_SCREEN.size[1] / 2
  const sideBottom = SIDE_SCREEN.position[1] - SIDE_SCREEN.size[1] / 2

  return (
    <group>
      <group position={MAIN_SCREEN.position}>
        <Screen size={MAIN_SCREEN.size} texture={main} />
        <group position={[0, -MAIN_SCREEN.size[1] / 2, 0]}>
          <Stand height={mainBottom - DESK_TOP} />
        </group>
      </group>
      <group position={SIDE_SCREEN.position} rotation={[0, SIDE_SCREEN.rotationY, 0]}>
        <Screen size={SIDE_SCREEN.size} texture={side} />
        <group position={[0, -SIDE_SCREEN.size[1] / 2, 0]}>
          <Stand height={sideBottom - DESK_TOP} />
        </group>
      </group>
    </group>
  )
}
