import { useEffect, useLayoutEffect } from 'react'
import { useSceneStore } from '../store/sceneStore'
import { detectTier, readDeviceInfo } from './quality'

export function useQualityTier() {
  const tier = useSceneStore((state) => state.tier)
  const setTier = useSceneStore((state) => state.setTier)

  // Layout effect: runs in the browser only (never in prerender) and before any passive
  // effect, so the preloader already sees the tier when it decides whether to load three.js.
  useLayoutEffect(() => {
    if (useSceneStore.getState().tier === null) setTier(detectTier(readDeviceInfo()))
  }, [setTier])

  useEffect(() => {
    if (tier) document.documentElement.dataset.scene = tier === 'static' ? 'static' : 'live'
  }, [tier])

  return tier
}
