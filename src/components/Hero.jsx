import { useRef } from 'react'
import { FiArrowDown } from 'react-icons/fi'
import { gsap, useGSAP } from '../lib/gsap'
import { profile } from '../data/profile'
import { localize } from '../data/localize'
import { useLang, useT } from '../i18n/useLang'
import { useTypewriter } from '../hooks/useTypewriter'
import HeroPortrait from './HeroPortrait'
import './css/Hero.css'

export default function Hero({ ready, reducedMotion }) {
  const lang = useLang()
  const t = useT()
  const ref = useRef(null)
  const roles = localize(profile.roles, lang)
  const role = useTypewriter(roles, { enabled: ready && !reducedMotion })

  useGSAP(
    () => {
      if (!ready || reducedMotion) return
      gsap
        .timeline({ defaults: { ease: 'power4.out' } })
        .from('.hero-name-line', { yPercent: 110, duration: 1.1, stagger: 0.12 })
        .from('.hero-portrait', { y: 60, opacity: 0, duration: 1.2 }, 0.15)
        .from('.hero-meta > *', { y: 20, opacity: 0, duration: 0.8, stagger: 0.08 }, 0.45)
    },
    { scope: ref, dependencies: [ready, reducedMotion] },
  )

  return (
    <section id="hero" className="hero" ref={ref} aria-labelledby="hero-title">
      <h1 id="hero-title" className="hero-name">
        <span className="hero-name-mask">
          <span className="hero-name-line">Miguel</span>
        </span>{' '}
        <span className="hero-name-mask">
          <span className="hero-name-line hero-name-outline">Ángel</span>
        </span>
      </h1>

      <HeroPortrait reducedMotion={reducedMotion} />

      <div className="hero-meta">
        <p className="hero-available">
          <span className="dot" aria-hidden="true" />
          {localize(profile.available, lang)}
        </p>
        <p className="hero-role">
          <span className="sr-only">{roles.join(', ')}</span>
          <span className="hero-role-text" aria-hidden="true">
            {role}
          </span>
          <span className="hero-caret" aria-hidden="true" />
        </p>
        <p className="hero-sub">
          {profile.name} · {localize(profile.location, lang)}
        </p>
        <div className="hero-ctas">
          <a className="btn btn-primary" href="#projects">
            {t('heroCtaProjects')}
          </a>
          <a className="btn" href="#contact">
            {t('heroCtaContact')}
          </a>
        </div>
      </div>

      <a href="#about" className="hero-scroll" aria-label={t('scrollHint')}>
        <FiArrowDown aria-hidden="true" />
      </a>
    </section>
  )
}
