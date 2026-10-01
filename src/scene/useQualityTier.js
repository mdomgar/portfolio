import { useEffect } from 'react'
import { useSceneStore } from '../store/sceneStore'

export function useQualityTier() {
  const tier = useSceneStore((state) => state.tier)

  useEffect(() => {
    if (tier) document.documentElement.dataset.scene = tier === 'static' ? 'static' : 'live'
  }, [tier])

  return tier
}
