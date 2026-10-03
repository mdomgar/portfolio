import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { FiArrowUpRight } from 'react-icons/fi'
import { services } from '../data/services'
import { getCase } from '../data/cases'
import { localize } from '../data/localize'
import { useLang, useT } from '../i18n/useLang'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useSceneCue } from '../hooks/useSceneCue'
import { ScrollTrigger, useGSAP } from '../lib/gsap'
import { stepForProgress } from '../lib/progress'
import SectionHeading from './SectionHeading'
import ScreenPreview from './ScreenPreview'
import SplitWords from './SplitWords'
import './css/Services.css'

const NARROW = '(max-width: 767px)'
const REDUCED = '(prefers-reduced-motion: reduce)'

function ServiceProof({ service }) {
  const t = useT()
  if (!service.caseSlug) return null
  const item = getCase(service.caseSlug)
  return (
    <Link className="service-proof" to={`/casos/${item.slug}`}>
      {t('servicesProof')}: {item.name}
      <FiArrowUpRight aria-hidden="true" />
    </Link>
  )
}

// One markup for both layouts. Services.css stacks the panels by default (phones, reduced motion and
// the prerendered HTML, which cannot know either) and only pins them where motion and width allow it,
// so hydration never flips the layout. `data-mode` mirrors what JS decided; the pin is armed only when pinned.
export default function Services({ reducedMotion }) {
  const lang = useLang()
  const t = useT()
  const pinRef = useRef(null)
  const triggerRef = useRef(null)
  const activeRef = useRef(0)
  const narrow = useMediaQuery(NARROW)
  const stacked = narrow || reducedMotion
  const [active, setActive] = useState(0)
  // True after a keyboard-driven change, until the next scroll-driven one: no transition in between.
  const [instant, setInstant] = useState(false)
  const [pinned, setPinned] = useState(false)

  useSceneCue(!stacked && pinned ? services[active].pose : null)

  const show = (step, keyboard) => {
    activeRef.current = step
    setInstant(keyboard)
    setActive(step)
  }

  useGSAP(
    () => {
      // Hydration renders once with the server snapshot (never stacked), so ask the browser directly:
      // the pin must not be armed on a phone just to be torn down a frame later.
      if (stacked || window.matchMedia(NARROW).matches || window.matchMedia(REDUCED).matches) return
      setPinned(false)
      triggerRef.current = ScrollTrigger.create({
        trigger: pinRef.current,
        start: 'top top',
        end: () => `+=${window.innerHeight * (services.length - 1)}`,
        pin: true,
        onUpdate: (self) => {
          const step = stepForProgress(self.progress, services.length)
          if (step !== activeRef.current) show(step, false)
        },
        onToggle: (self) => setPinned(self.isActive),
      })
    },
    { scope: pinRef, dependencies: [stacked], revertOnUpdate: true },
  )

  const focusService = (index) => {
    if (stacked || index === activeRef.current) return
    show(index, true)
    // Keep the scroll in step with the panel, or the next scroll event would hide it again.
    const trigger = triggerRef.current
    if (trigger) window.scrollTo(0, trigger.start + ((index + 0.5) / services.length) * (trigger.end - trigger.start))
  }

  return (
    <section
      id="servicios"
      className="section services"
      data-mode={stacked ? 'stacked' : 'pinned'}
      data-instant={instant ? 'true' : 'false'}
      aria-labelledby="servicios-title"
    >
      <div className="services-pin" ref={pinRef}>
        <div className="container services-inner">
          <SectionHeading id="servicios-title" eyebrow="01" title={t('servicesTitle')} />
          <div className="services-stage">
            <ol className="services-panels">
              {services.map((service, index) => (
                <li
                  key={service.id}
                  className="service-panel"
                  data-active={index === active ? 'true' : 'false'}
                  onFocus={() => focusService(index)}
                >
                  <div className="service-copy">
                    <p className="services-number mono" aria-hidden="true">
                      <span className="services-number-digits">{service.number}</span>
                    </p>
                    <h3>{localize(service.title, lang)}</h3>
                    <p className="service-message">
                      <SplitWords text={localize(service.message, lang)} mask />
                    </p>
                    <p className="service-includes">{localize(service.includes, lang)}</p>
                    <ServiceProof service={service} />
                  </div>
                  <figure className="service-figure">
                    <ScreenPreview screen={service.screen} reducedMotion={stacked} />
                  </figure>
                </li>
              ))}
            </ol>
            <div className="services-progress" aria-hidden="true">
              <span className="services-progress-track">
                <span
                  className="services-progress-bar"
                  style={{ transform: `scaleX(${(active + 1) / services.length})` }}
                />
              </span>
              <span className="services-progress-count mono">
                {active + 1}/{services.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
