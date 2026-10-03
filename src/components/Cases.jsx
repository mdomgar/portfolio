import { Link } from 'react-router'
import { FiArrowRight } from 'react-icons/fi'
import { cases } from '../data/cases'
import { localize } from '../data/localize'
import { useLang, useT } from '../i18n/useLang'
import Reveal from './Reveal'
import SectionHeading from './SectionHeading'
import TechList from './TechList'
import './css/Cases.css'

export default function Cases() {
  const lang = useLang()
  const t = useT()

  return (
    <section id="casos" className="section cases" aria-labelledby="casos-title">
      <div className="container">
        <SectionHeading id="casos-title" eyebrow="02" title={t('casesTitle')} />
        <Reveal as="ul" className="cases-grid">
          {cases.map((item) => (
            <li key={item.slug}>
              <article className="card case-card" data-tilt aria-labelledby={`case-${item.slug}-title`}>
                <header className="case-card-head" style={{ viewTransitionName: `case-${item.slug}` }}>
                  <p className="case-label mono">{localize(item.label, lang)}</p>
                  <h3 id={`case-${item.slug}-title`}>{item.name}</h3>
                </header>
                <p className="case-tagline">{localize(item.tagline, lang)}</p>
                {item.highlight && <p className="case-highlight">{localize(item.highlight, lang)}</p>}
                {item.stats.length > 0 && (
                  <ul className="case-stats">
                    {item.stats.map((stat) => (
                      <li key={stat.id}>
                        <span className="case-stat-value">{stat.value}</span>{' '}
                        <span className="case-stat-label">{localize(stat.label, lang)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <TechList ids={item.stack} label={t('caseStack')} />
                <Link className="case-link" to={`/casos/${item.slug}`} viewTransition>
                  {t('caseCta')}
                  <span className="sr-only"> · {item.name}</span>
                  <FiArrowRight aria-hidden="true" />
                </Link>
              </article>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
