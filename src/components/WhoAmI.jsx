import { useRef, useState } from 'react'
import { profile } from '../data/profile'
import { experience, JOURNEY_IDS } from '../data/experience'
import { localize } from '../data/localize'
import { useLang, useT } from '../i18n/useLang'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'
import SectionHeading from './SectionHeading'
import SplitWords from './SplitWords'
import TechMarquee from './TechMarquee'
import './css/WhoAmI.css'

const JOURNEY = JOURNEY_IDS.map((id) => experience.find((job) => job.id === id))

export default function WhoAmI({ reducedMotion }) {
  const lang = useLang()
  const t = useT()
  const ref = useRef(null)
  const [journeyLit, setJourneyLit] = useState(false)
  const [open, setOpen] = useState(null)

  useGSAP(
    () => {
      if (reducedMotion) return
      // The text "reads itself": each word goes from 0.15 to full opacity with the scroll.
      gsap.fromTo(
        '.whoami-text .w',
        { opacity: 0.15 },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.05,
          scrollTrigger: { trigger: '.whoami-text', start: 'top 80%', end: 'bottom 50%', scrub: true },
        },
      )
      ScrollTrigger.create({ trigger: '.journey', start: 'top 80%', once: true, onEnter: () => setJourneyLit(true) })
    },
    { scope: ref, dependencies: [reducedMotion], revertOnUpdate: true },
  )

  return (
    <section id="quien-soy" ref={ref} className="section whoami" aria-labelledby="quien-soy-title">
      <div className="container">
        <SectionHeading id="quien-soy-title" eyebrow="04" title={t('whoTitle')} />
        <p className="whoami-hook">{localize(profile.about.hook, lang)}</p>
        <p className="whoami-text">
          <SplitWords text={localize(profile.about.text, lang)} />
        </p>

        <h3 className="whoami-subtitle">{t('whoJourney')}</h3>
        <ol className="journey" data-lit={reducedMotion || journeyLit ? 'true' : 'false'}>
          {JOURNEY.map((job, index) => (
            <li key={job.id} className="journey-stop" style={{ '--i': index }}>
              <button
                type="button"
                className="journey-button"
                aria-expanded={open === job.id}
                onClick={() => setOpen((current) => (current === job.id ? null : job.id))}
              >
                <span className="journey-dot" aria-hidden="true" />
                <span className="journey-name">{job.shortName}</span>
              </button>
              <p className="journey-detail">
                <span>{localize(job.role, lang)}</span>
                <span className="mono">{localize(job.period, lang)}</span>
                {job.end === null && <span className="chip chip-live">{t('current')}</span>}
              </p>
            </li>
          ))}
        </ol>

        <p className="whoami-education">{localize(profile.about.education, lang)}</p>
        <h3 className="whoami-subtitle">{t('whoStackTitle')}</h3>
      </div>
      <TechMarquee />
    </section>
  )
}
