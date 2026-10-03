import { useOutletContext } from 'react-router'
import Hero from '../components/Hero'
import Services from '../components/Services'
import About from '../components/About'
import Experience from '../components/Experience'
import Projects from '../components/Projects'
import Education from '../components/Education'
import Contact from '../components/Contact'
import { useActiveSection } from '../hooks/useActiveSection'
import { SECTION_IDS } from '../data/sections'
import { getPageSeo } from '../data/seo'
import { buildMeta } from '../lib/seo'

export const meta = () => buildMeta({ path: '/', ...getPageSeo('/') })

export const links = () => [
  {
    rel: 'preload',
    as: 'image',
    href: '/img/portrait-1086.webp',
    imageSrcSet: '/img/portrait-540.webp 540w, /img/portrait-1086.webp 1086w',
    imageSizes: '(max-width: 768px) 78vw, 520px',
    fetchPriority: 'high',
  },
]

export default function Home() {
  const { ready, reducedMotion } = useOutletContext()
  useActiveSection(SECTION_IDS)

  return (
    <>
      <Hero ready={ready} reducedMotion={reducedMotion} />
      <Services reducedMotion={reducedMotion} />
      <About reducedMotion={reducedMotion} />
      <Experience reducedMotion={reducedMotion} />
      <Projects reducedMotion={reducedMotion} />
      <Education />
      <Contact />
    </>
  )
}
