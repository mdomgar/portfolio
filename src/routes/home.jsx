import { profile } from '../data/profile'
import { getPageSeo } from '../data/seo'
import { buildJsonLd, buildMeta } from '../lib/seo'

export const meta = () => [...buildMeta({ path: '/', ...getPageSeo('/') }), { 'script:ld+json': buildJsonLd() }]

export default function Home() {
  return (
    <section id="inicio" className="section">
      <div className="container">
        <h1>{profile.shortName}</h1>
      </div>
    </section>
  )
}
