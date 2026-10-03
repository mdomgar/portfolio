import { Link } from 'react-router'
import { FaGithub } from 'react-icons/fa'
import { FiExternalLink } from 'react-icons/fi'
import { localize } from '../data/localize'
import { useLang, useT } from '../i18n/useLang'
import { formatDate } from '../lib/format'
import ScreenPreview from './ScreenPreview'
import TechList from './TechList'
import './css/CaseStudy.css'

export default function CaseStudy({ item, reducedMotion }) {
  const lang = useLang()
  const t = useT()
  const done = item.status === 'done'

  return (
    <article className="case-page" aria-labelledby="case-title">
      <header className="container case-hero">
        <div className="case-hero-head" style={{ viewTransitionName: `case-${item.slug}` }}>
          <p className="case-page-label mono">{localize(item.label, lang)}</p>
          <h1 id="case-title">{item.name}</h1>
        </div>
        <p className="case-hero-tagline">{localize(item.tagline, lang)}</p>
        <TechList ids={item.stack} label={t('caseStack')} />
        {(item.links.demo || item.links.code) && (
          <div className="case-hero-links">
            {item.links.demo && (
              <a className="btn btn-primary" href={item.links.demo} target="_blank" rel="noopener noreferrer">
                <FiExternalLink aria-hidden="true" />
                {t('caseDemo')}
                <span className="sr-only"> · {item.name}</span>
              </a>
            )}
            {item.links.code && (
              <a className="btn" href={item.links.code} target="_blank" rel="noopener noreferrer">
                <FaGithub aria-hidden="true" />
                {t('caseCode')}
                <span className="sr-only"> · {item.name}</span>
              </a>
            )}
          </div>
        )}
      </header>

      <div className="container case-body">
        <figure className="case-figure">
          <ScreenPreview screen={item.preview} reducedMotion={reducedMotion} />
        </figure>

        <section className="case-section" aria-labelledby="case-challenge">
          <h2 id="case-challenge">{t('caseChallenge')}</h2>
          <p>{localize(item.challenge, lang)}</p>
        </section>

        <section className="case-section" aria-labelledby="case-built">
          <h2 id="case-built">{t(done ? 'caseBuilt' : 'caseBuilding')}</h2>
          <ul className="case-built">
            {localize(item.built, lang).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>

        {item.flow && (
          <section className="case-section" aria-labelledby="case-flow">
            <h2 id="case-flow">{localize(item.flow.title, lang)}</h2>
            <ol className="case-flow">
              {item.flow.steps.map((step) => (
                <li key={step.title.es}>
                  <h3>{localize(step.title, lang)}</h3>
                  <p>{localize(step.text, lang)}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        <section className="case-section" aria-labelledby="case-decisions">
          <h2 id="case-decisions">{t('caseDecisions')}</h2>
          <ol className="case-decisions" aria-labelledby="case-decisions">
            {item.decisions.map((decision) => (
              <li key={decision.title.es}>
                <h3>{localize(decision.title, lang)}</h3>
                <p>{localize(decision.why, lang)}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="case-section" aria-labelledby="case-result">
          <h2 id="case-result">{t(done ? 'caseResult' : 'caseResultSoFar')}</h2>
          {item.stats.length > 0 && (
            <ul className="case-page-stats">
              {item.stats.map((stat) => (
                <li key={stat.id}>
                  <span className="case-page-stat-value">{stat.value}</span>{' '}
                  <span>{localize(stat.label, lang)}</span>
                </li>
              ))}
            </ul>
          )}
          <p>{localize(item.result, lang)}</p>
        </section>

        <section className="case-section" aria-labelledby="case-next">
          <h2 id="case-next">{t(done ? 'caseNextDone' : 'caseNextInProgress')}</h2>
          <p>{localize(item.next, lang)}</p>
        </section>

        {item.journal && (
          <section className="case-section" aria-labelledby="case-journal">
            <h2 id="case-journal">{t('caseJournal')}</h2>
            <ol className="case-journal">
              {item.journal.map((entry) => (
                <li key={entry.date}>
                  <time dateTime={entry.date}>{formatDate(entry.date, lang)}</time>
                  <p>{localize(entry.text, lang)}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        <aside className="card case-cta" aria-labelledby="case-cta-title">
          <h2 id="case-cta-title">{t('caseCtaTitle')}</h2>
          <Link className="btn btn-primary" to="/#brief">
            {t('ctaBrief')}
          </Link>
        </aside>
      </div>
    </article>
  )
}
