import Navbar from './components/Navbar'
import { useReducedMotion } from './hooks/useReducedMotion'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import { useActiveSection } from './hooks/useActiveSection'
import { SECTION_IDS } from './data/sections'

export default function App() {
  const reducedMotion = useReducedMotion()
  useSmoothScroll(!reducedMotion)
  useActiveSection(SECTION_IDS)

  return (
    <>
      <Navbar />
      <main id="main"></main>
    </>
  )
}
