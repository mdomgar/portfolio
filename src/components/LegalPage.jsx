import { profile } from '../data/profile'
import { localize } from '../data/localize'
import { useLang, useT } from '../i18n/useLang'
import { fill, formatDate } from '../lib/format'
import OwnerDetails from './OwnerDetails'

export default function LegalPage({ page }) {
  const lang = useLang()
  const t = useT()
  const values = { holder: profile.legal.holder, address: localize(profile.legal.address, lang), email: profile.email }

  return (
    <article className="section page-simple legal-page" aria-labelledby="legal-title">
      <div className="container legal-body">
        <h1 id="legal-title">{localize(page.title, lang)}</h1>
        <p className="legal-intro">{localize(page.intro, lang)}</p>
        {page.sections.map((section) => (
          <section key={section.id} aria-labelledby={`legal-${section.id}`}>
            <h2 id={`legal-${section.id}`}>{localize(section.title, lang)}</h2>
            {/* Static copy: the position is a stable key (two equal paragraphs would collide as text). */}
            {localize(section.body, lang).map((paragraph, index) => (
              <p key={`${section.id}-${index}`}>{fill(paragraph, values)}</p>
            ))}
            {section.owner && <OwnerDetails legal={profile.legal} />}
          </section>
        ))}
        <p className="legal-updated mono">
          {t('legalUpdated')} <time dateTime={page.updated}>{formatDate(page.updated, lang)}</time>
        </p>
      </div>
    </article>
  )
}
