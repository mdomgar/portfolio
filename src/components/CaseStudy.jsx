import { Link } from 'react-router'
import { FaGithub } from 'react-icons/fa'
import { FiArrowLeft, FiExternalLink } from 'react-icons/fi'
import { localize } from '../data/localize'
import { useLang, useT } from '../i18n/useLang'
import DeviceFrame from './DeviceFrame'
import ScreenPreview from './ScreenPreview'
import TechList from './TechList'
import './css/CaseStudy.css'

export default function CaseStudy({ item, reducedMotion }) {
  const lang = useLang()
  const t = useT()
  const done = item.status === 'done'

  return (
    <article className="case-page" style={{ '--block': item.color }} aria-labelledby="case-title">
      <header className="case-hero">
        <div className="container case-hero-inner">
          <Link className="btn case-back" to="/">
            <FiArrowLeft aria-hidden="true" />
            {t('backHome')}
          </Link>
          <div className="case-hero-head" style={{ viewTransitionName: `case-${item.slug}` }}>
            <p className="case-page-label label">{localize(item.label, lang)}</p>
            <h1 id="case-title" className="giant case-name" style={{ '--em': 7.95 }}>
              {item.name}
            </h1>
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
        </div>
      </header>

      <div className="container case-body">
        <figure className="case-figure">
          <DeviceFrame>
            <ScreenPreview screen={item.preview} reducedMotion={reducedMotion} />
          </DeviceFrame>
        </figure>

        <section className="case-section" aria-labelledby="case-challenge">
          <h2 id="case-challenge">{t('caseChallenge')}</h2>
          <div className="case-section-body">
            <p>{localize(item.challenge, lang)}</p>
          </div>
        </section>

        <section className="case-section" aria-labelledby="case-built">
          <h2 id="case-built">{t(done ? 'caseBuilt' : 'caseBuilding')}</h2>
          <div className="case-section-body">
            <ul className="case-built">
              {localize(item.built, lang).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="case-section" aria-labelledby="case-decisions">
          <h2 id="case-decisions">{t('caseDecisions')}</h2>
          <div className="case-section-body">
            <ol className="case-decisions" aria-labelledby="case-decisions">
              {item.decisions.map((decision) => (
                <li key={decision.title.es}>
                  <h3>{localize(decision.title, lang)}</h3>
                  <p>{localize(decision.why, lang)}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="case-section" aria-labelledby="case-result">
          <h2 id="case-result">{t(done ? 'caseResult' : 'caseResultSoFar')}</h2>
          <div className="case-section-body">
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
          </div>
        </section>

        <section className="case-section" aria-labelledby="case-next">
          <h2 id="case-next">{t(done ? 'caseNextDone' : 'caseNextInProgress')}</h2>
          <div className="case-section-body">
            <p>{localize(item.next, lang)}</p>
          </div>
        </section>

        <Link className="btn case-back case-back-end" to="/">
          <FiArrowLeft aria-hidden="true" />
          {t('backHome')}
        </Link>
      </div>
    </article>
  )
}
