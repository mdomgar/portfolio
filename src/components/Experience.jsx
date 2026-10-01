import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { experience } from '../data/experience'
import { localize } from '../data/localize'
import { useLang, useT } from '../i18n/useLang'
import SectionHeading from './SectionHeading'
import './css/Experience.css'

export default function Experience({ reducedMotion }) {
  const lang = useLang()
  const t = useT()
  const ref = useRef(null)

  useGSAP(
    () => {
      if (reducedMotion) return
      gsap.fromTo(
        '.timeline-progress',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: '.timeline', start: 'top 70%', end: 'bottom 60%', scrub: true },
        },
      )
      gsap.utils.toArray('.timeline-item').forEach((item) => {
        gsap.from(item, {
          x: 40,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: item, start: 'top 85%', once: true },
        })
      })
    },
    { scope: ref, dependencies: [reducedMotion] },
  )

  return (
    <section id="experience" className="section" aria-labelledby="experience-title" ref={ref}>
      <div className="container">
        <SectionHeading id="experience-title" eyebrow="02" title={t('experienceTitle')} />
        <div className="timeline">
          <span className="timeline-rail" aria-hidden="true">
            <span className="timeline-progress" />
          </span>
          <ol className="timeline-list">
            {experience.map((job) => (
              <li key={job.id} className={`timeline-item${job.end === null ? ' is-current' : ''}`}>
                <span className="timeline-dot" aria-hidden="true" />
                <article className="card timeline-card">
                  <header className="timeline-header">
                    <div>
                      <h3>{localize(job.role, lang)}</h3>
                      <p className="timeline-company">
                        {job.company} · {job.location}
                      </p>
                    </div>
                    <div className="timeline-meta">
                      {job.end === null && <span className="chip chip-live">{t('current')}</span>}
                      <p className="mono">{localize(job.period, lang)}</p>
                    </div>
                  </header>
                  <ul className="timeline-tasks">
                    {localize(job.tasks, lang).map((task) => (
                      <li key={task}>{task}</li>
                    ))}
                  </ul>
                </article>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
