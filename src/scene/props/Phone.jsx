import { RoundedBox } from '@react-three/drei'
import { isPhoneLit } from '../poses'
import { selectPoseId, useSceneStore } from '../../store/sceneStore'
import { useLang } from '../../i18n/useLang'
import { useCanvasTexture } from '../useCanvasTexture'
import { SCREENS } from '../screens'
import { PHONE } from '../layout'

const BODY_HEIGHT = 0.009

export default function Phone({ reducedMotion }) {
  const lang = useLang()
  const lit = useSceneStore((state) => isPhoneLit(selectPoseId(state)))
  const { width, height, draw } = SCREENS.seenat
  const texture = useCanvasTexture({
    width,
    height,
    fps: 20,
    animate: lit && !reducedMotion,
    draw: (ctx, time, w, h) => draw(ctx, time, w, h, reducedMotion, lang),
  })
  const [w, d] = PHONE.size

  return (
    <group position={PHONE.position} rotation={[0, PHONE.rotationY, 0]}>
      <RoundedBox args={[w, BODY_HEIGHT, d]} radius={0.004} smoothness={3} position={[0, BODY_HEIGHT / 2, 0]} castShadow>
        <meshStandardMaterial color="#0d1017" metalness={0.4} roughness={0.35} />
      </RoundedBox>
      <mesh position={[0, BODY_HEIGHT + 0.0002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w - 0.006, d - 0.008]} />
        {lit ? (
          <meshBasicMaterial map={texture} toneMapped={false} />
        ) : (
          <meshStandardMaterial color="#05060a" metalness={0.6} roughness={0.2} />
        )}
      </mesh>
    </group>
  )
}
