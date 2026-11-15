import { useRef } from 'react'
import { FaGithub, FaLinkedin } from 'react-icons/fa'
import { profile } from '../data/profile'
import { useHydrated } from '../hooks/useHydrated'
import { useLang, useT } from '../i18n/useLang'
import { gsap, useGSAP } from '../lib/gsap'
import CopyEmailButton from './CopyEmailButton'
import SplitLetters from './SplitLetters'
import './css/Contact.css'

// The last impression: the closing word fills the line and builds up letter by letter as the visitor
// arrives; the invitation and the three actions follow it.
export default function Contact({ reducedMotion }) {
  const lang = useLang()
  const t = useT()
  const hydrated = useHydrated()
  const live = hydrated && !reducedMotion
  const root = useRef(null)

  useGSAP(
    () => {
      if (!live) return
      const section = root.current
      const scrub = (trigger, start, end) => ({ trigger, start, end, scrub: 0.6, invalidateOnRefresh: true })

      gsap.fromTo(
        section.querySelectorAll('.contact-word .l-inner'),
        { yPercent: 120, rotation: 9 },
        {
          yPercent: 0,
          rotation: 0,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: scrub(section, 'top 80%', 'top 12%'),
        },
      )
      gsap.fromTo(
        section.querySelectorAll('.contact-lead, .contact-actions > *'),
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.12,
          ease: 'power2.out',
          scrollTrigger: scrub(section, 'top 45%', 'top 0%'),
        },
      )
    },
    { scope: root, dependencies: [live, lang], revertOnUpdate: true },
  )

  return (
    <section id="contacto" ref={root} className="section contact on-ink" aria-labelledby="contact-title">
      <div className="container contact-inner">
        <h2 id="contact-title" className="giant contact-word" style={{ '--em': 5.75 }}>
          <SplitLetters text={t('contactTitle')} />
        </h2>
        <p className="contact-lead">{t('contactLead')}</p>
        <div className="contact-actions">
          <CopyEmailButton email={profile.email} />
          <a className="btn" href={profile.linkedin} target="_blank" rel="noopener noreferrer">
            <FaLinkedin aria-hidden="true" />
            LinkedIn
          </a>
          <a className="btn" href={profile.github} target="_blank" rel="noopener noreferrer">
            <FaGithub aria-hidden="true" />
            GitHub
          </a>
        </div>
      </div>
    </section>
  )
}
