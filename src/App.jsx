import { useCallback, useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Experience from './components/Experience'
import Preloader from './components/Preloader'
import SceneLayer from './scene/SceneLayer'
import { loadScene } from './scene/loadScene'
import { useQualityTier } from './scene/useQualityTier'
import { useReducedMotion } from './hooks/useReducedMotion'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import { useActiveSection } from './hooks/useActiveSection'
import { SECTION_IDS } from './data/sections'
import { loadImage } from './lib/loadImage'
import { useSceneStore } from './store/sceneStore'

const PRELOAD_TASKS = [
  () => document.fonts?.ready,
  () => loadImage(window.innerWidth < 768 ? '/img/portrait-540.webp' : '/img/portrait-1086.webp'),
  () => (useSceneStore.getState().tier === 'static' ? null : loadScene()),
]

export default function App() {
  const reducedMotion = useReducedMotion()
  const [ready, setReady] = useState(false)
  const handleLoaded = useCallback(() => setReady(true), [])

  useQualityTier()
  useSmoothScroll(ready && !reducedMotion)
  useActiveSection(SECTION_IDS)

  return (
    <>
      <SceneLayer reducedMotion={reducedMotion} />
      <Navbar />
      <main id="main">
        <Hero ready={ready} reducedMotion={reducedMotion} />
        <About reducedMotion={reducedMotion} />
        <Experience reducedMotion={reducedMotion} />
      </main>
      <Preloader tasks={PRELOAD_TASKS} reducedMotion={reducedMotion} onDone={handleLoaded} />
    </>
  )
}
