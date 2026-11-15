import { useOutletContext } from 'react-router'
import Acts from '../components/Acts'
import Background from '../components/Background'
import Contact from '../components/Contact'
import Opening, { DESKTOP_QUERY, PORTRAIT_QUERY } from '../components/Opening'
import Projects from '../components/Projects'
import Today from '../components/Today'
import { getPageSeo } from '../data/seo'
import { frameUrl } from '../data/sequence'
import { buildJsonLd, buildMeta } from '../lib/seo'

export const meta = () => [...buildMeta({ path: '/', ...getPageSeo('/') }), { 'script:ld+json': buildJsonLd() }]

// Static layout of the whole page: it is also what reduced motion and no-JS visitors get.
// The first frame of each variant (the one the visitor's screen will use) and the font of the name are
// needed at once, so the browser fetches them before it has even built the page.
export const links = () => [
  {
    rel: 'preload',
    as: 'image',
    href: frameUrl('desktop', 1),
    type: 'image/webp',
    media: DESKTOP_QUERY,
    fetchPriority: 'high',
  },
  { rel: 'preload', as: 'image', href: frameUrl('mobile', 1), type: 'image/webp', media: PORTRAIT_QUERY, fetchPriority: 'high' },
  { rel: 'preload', href: '/fonts/clash-display-700.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
]

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
