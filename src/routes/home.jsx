import { useOutletContext } from 'react-router'
import Acts from '../components/Acts'
import Background from '../components/Background'
import Contact from '../components/Contact'
import Opening from '../components/Opening'
import Projects from '../components/Projects'
import Today from '../components/Today'
import { getPageSeo } from '../data/seo'
import { buildJsonLd, buildMeta } from '../lib/seo'

export const meta = () => [...buildMeta({ path: '/', ...getPageSeo('/') }), { 'script:ld+json': buildJsonLd() }]

// Static layout of the whole page: it is also what reduced motion and no-JS visitors get.
export default function Home() {
  const { reducedMotion } = useOutletContext()

  return (
    <>
      <Opening reducedMotion={reducedMotion} />
      <Today reducedMotion={reducedMotion} />
      <Acts reducedMotion={reducedMotion} />
      <Projects reducedMotion={reducedMotion} />
      <Background reducedMotion={reducedMotion} />
      <Contact reducedMotion={reducedMotion} />
    </>
  )
}
