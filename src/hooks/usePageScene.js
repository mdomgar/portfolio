import { useEffect } from 'react'
import { useSceneStore } from '../store/sceneStore'

export function usePageScene(section) {
  const setSection = useSceneStore((state) => state.setSection)
  useEffect(() => {
    setSection(section)
  }, [section, setSection])
}
