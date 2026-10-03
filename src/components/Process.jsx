import { useRef, useState } from 'react'
import { processSteps } from '../data/process'
import { localize } from '../data/localize'
import { useLang, useT } from '../i18n/useLang'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'
import SectionHeading from './SectionHeading'
import './css/Process.css'

export default function Process({ reducedMotion }) {
  const lang = useLang()
  const t = useT()
  const ref = useRef(null)
  const [lit, setLit] = useState(0)
  const [armed, setArmed] = useState(false)
  const shown = reducedMotion ? processSteps.length : lit

  useGSAP(
    () => {
      if (reducedMotion) {
        setArmed(false)
        return
      }
      gsap.fromTo(
        '.process-line-fill',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: '.process-steps', start: 'top 70%', end: 'bottom 70%', scrub: true },
        },
      )
      gsap.utils.toArray('.process-step', ref.current).forEach((step, index) => {
        ScrollTrigger.create({
          trigger: step,
          start: 'top 70%',
          onEnter: () => setLit((current) => Math.max(current, index + 1)),
          onLeaveBack: () => setLit(index),
        })
      })
      setArmed(true)
    },
    { scope: ref, dependencies: [reducedMotion], revertOnUpdate: true },
  )

  return (
    <section
      id="proceso"
      ref={ref}
      className="section process"
      data-armed={armed && !reducedMotion ? 'true' : undefined}
      aria-labelledby="proceso-title"
    >
      <div className="container">
        <SectionHeading id="proceso-title" eyebrow="03" title={t('processTitle')} />
        <div className="process-track">
          <span className="process-line" aria-hidden="true">
            <span className="process-line-fill" />
          </span>
          <ol className="process-steps">
            {processSteps.map((step, index) => (
              <li key={step.id} className="process-step" data-lit={index < shown ? 'true' : 'false'}>
                <span className="process-number mono" aria-hidden="true">
                  {step.number}
                </span>
                <div className="process-text">
                  <h3>{localize(step.title, lang)}</h3>
                  <p>{localize(step.detail, lang)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
