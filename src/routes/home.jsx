import { useOutletContext } from 'react-router'
import Hero from '../components/Hero'
import Services from '../components/Services'
import Cases from '../components/Cases'
import Process from '../components/Process'
import WhoAmI from '../components/WhoAmI'
import Now from '../components/Now'
import Brief from '../components/Brief'
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
      <Cases />
      <Process reducedMotion={reducedMotion} />
      <WhoAmI reducedMotion={reducedMotion} />
      <Now />
      <Brief />
    </>
  )
}
