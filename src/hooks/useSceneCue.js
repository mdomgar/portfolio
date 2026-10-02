import { useEffect } from 'react'
import { useSceneStore } from '../store/sceneStore'

// Holds a camera cue while `cue` is set; releases only its own cue when it changes or unmounts.
export function useSceneCue(cue) {
  const setSceneCue = useSceneStore((state) => state.setSceneCue)
  const releaseSceneCue = useSceneStore((state) => state.releaseSceneCue)

  useEffect(() => {
    if (!cue) return undefined
    setSceneCue(cue)
    return () => releaseSceneCue(cue)
  }, [cue, setSceneCue, releaseSceneCue])
}
