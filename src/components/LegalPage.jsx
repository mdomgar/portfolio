import { Link } from 'react-router'
import { FiArrowLeft } from 'react-icons/fi'
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
    <article className="legal-page" aria-labelledby="legal-title">
      <header className="legal-hero">
        <div className="container legal-hero-inner">
          <Link className="btn legal-back" to="/">
            <FiArrowLeft aria-hidden="true" />
            {t('backHome')}
          </Link>
          <h1 id="legal-title" className="giant legal-title" style={{ '--em': 5.9 }}>
            {localize(page.title, lang)}
          </h1>
          <p className="legal-intro">{localize(page.intro, lang)}</p>
        </div>
      </header>
      <div className="container legal-body">
        {page.sections.map((section) => (
          <section key={section.id} className="legal-section" aria-labelledby={`legal-${section.id}`}>
            <h2 id={`legal-${section.id}`}>{localize(section.title, lang)}</h2>
            <div className="legal-section-body">
              {/* Static copy: the position is a stable key (two equal paragraphs would collide as text). */}
              {localize(section.body, lang).map((paragraph, index) => (
                <p key={`${section.id}-${index}`}>{fill(paragraph, values)}</p>
              ))}
              {section.owner && <OwnerDetails legal={profile.legal} />}
            </div>
          </section>
        ))}
        <p className="legal-updated mono">
          {t('legalUpdated')} <time dateTime={page.updated}>{formatDate(page.updated, lang)}</time>
        </p>
      </div>
    </article>
  )
}
