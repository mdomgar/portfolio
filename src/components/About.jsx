import { profile } from '../data/profile'
import { experience } from '../data/experience'
import { TECH, skillCategories } from '../data/skills'
import { localize } from '../data/localize'
import { useLang, useT } from '../i18n/useLang'
import Reveal from './Reveal'
import SectionHeading from './SectionHeading'
import CountUp from './CountUp'
import TechMarquee from './TechMarquee'
import './css/About.css'

const currentJob = experience.find((job) => job.end === null)

export default function About({ reducedMotion }) {
  const lang = useLang()
  const t = useT()

  return (
    <section id="about" className="section about" aria-labelledby="about-title">
      <div className="container">
        <SectionHeading id="about-title" eyebrow="01" title={t('aboutTitle')} />
        <Reveal className="bento">
          <article className="card bento-bio">
            <p className="bento-kicker">{t('aboutHello')}</p>
            <p className="bento-bio-text">{localize(profile.bio, lang)}</p>
          </article>

          <article className="card bento-now" data-tilt>
            <p className="bento-kicker">
              <span className="dot" aria-hidden="true" /> {t('aboutNow')}
            </p>
            <h3>{localize(currentJob.role, lang)}</h3>
            <p className="bento-muted">@ {currentJob.company}</p>
          </article>

          <article className="card bento-location" data-tilt>
            <p className="bento-kicker">{t('aboutBasedIn')}</p>
            <h3>{localize(profile.location, lang)}</h3>
            <p className="bento-muted mono">37.78° N · 3.78° W</p>
            <div className="radar" aria-hidden="true">
              <span />
            </div>
          </article>

          {profile.stats.map((stat) => (
            <article key={stat.id} className="card bento-stat" data-tilt>
              <p className="bento-stat-value">
                <CountUp value={stat.value} decimals={stat.decimals} suffix={stat.suffix} reducedMotion={reducedMotion} />
              </p>
              <p className="bento-muted">{localize(stat.label, lang)}</p>
            </article>
          ))}

          <article className="card bento-stack">
            <p className="bento-kicker">{t('aboutStack')}</p>
            <div className="stack-groups">
              {skillCategories.map((category) => (
                <div key={category.id} className="stack-group">
                  <h4>{localize(category.label, lang)}</h4>
                  <ul className="stack-list">
                    {category.items.map((id) => {
                      const tech = TECH[id]
                      return (
                        <li key={id} className="chip">
                          <tech.Icon aria-hidden="true" style={{ color: tech.color }} />
                          {tech.name}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </article>
        </Reveal>
      </div>
      <TechMarquee />
    </section>
  )
}
