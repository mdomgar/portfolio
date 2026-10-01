import { lazy, Suspense } from 'react'
import { useSceneStore } from '../store/sceneStore'
import { DIMMED_SECTIONS } from './cameraPoses'
import { loadScene } from './loadScene'
import SceneErrorBoundary from './SceneErrorBoundary'
import SceneFallback from './SceneFallback'
import './scene.css'

const SceneCanvas = lazy(loadScene)

export default function SceneLayer({ reducedMotion }) {
  const tier = useSceneStore((state) => state.tier)
  const dimmed = useSceneStore((state) => DIMMED_SECTIONS.has(state.section))
  const setTier = useSceneStore((state) => state.setTier)

  if (!tier) return null

  return (
    <div className="scene-layer" data-dimmed={dimmed} aria-hidden="true">
      {tier === 'static' ? (
        <SceneFallback />
      ) : (
        <SceneErrorBoundary fallback={<SceneFallback />} onError={() => setTier('static')}>
          <Suspense fallback={<SceneFallback />}>
            <SceneCanvas tier={tier} reducedMotion={reducedMotion} />
          </Suspense>
        </SceneErrorBoundary>
      )}
    </div>
  )
}
