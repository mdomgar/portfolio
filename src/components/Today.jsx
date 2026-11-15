import { useRef } from 'react'
import { capabilities } from '../data/capabilities'
import { localize } from '../data/localize'
import { TECH } from '../data/skills'
import { useHydrated } from '../hooks/useHydrated'
import { useLang, useT } from '../i18n/useLang'
import { gsap, useGSAP } from '../lib/gsap'
import SplitWords from './SplitWords'
import './css/Today.css'

// Two lines of technology names that slide sideways, in opposite directions, as the section scrolls by.
const STRIPS = [
  ['javascript', 'react', 'node', 'java'],
  ['springboot', 'postgresql', 'docker', 'flutter'],
]

// "Qué hago hoy": the first thing after the dive. The heading and the four capabilities come in with the
// scroll, one line at a time, and the technology strip moves with it. Without motion (or before hydration)
// everything is simply there.
export default function Today({ reducedMotion }) {
  const lang = useLang()
  const t = useT()
  const hydrated = useHydrated()
  const live = hydrated && !reducedMotion
  const root = useRef(null)

  useGSAP(
    () => {
      if (!live) return
      const section = root.current

      // Heading: each word rises out of its mask.
      gsap.fromTo(
        section.querySelectorAll('.today-title .w-inner'),
        { yPercent: 115, rotation: 6 },
        {
          yPercent: 0,
          rotation: 0,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 75%', end: 'top 15%', scrub: 0.6 },
        },
      )

      // Rows: the rule draws, the name is typed in left to right, the proof settles under it.
      gsap.utils.toArray('.today-item', section).forEach((item) => {
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: item, start: 'top 92%', end: 'top 58%', scrub: 0.6 },
        })
        tl.fromTo(item, { '--rule': 0 }, { '--rule': 1, duration: 0.4 }, 0)
          .fromTo(
            item.querySelector('.today-name'),
            { clipPath: 'inset(0 100% 0 0)' },
            { clipPath: 'inset(0 0% 0 0)', duration: 0.6 },
            0.1,
          )
          .fromTo(
            [item.querySelector('.today-index'), item.querySelector('.today-proof')],
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' },
            0.35,
          )
      })

      // Strip: rows travel the whole way from edge to edge, one each way.
      gsap.utils.toArray('.today-strip-row', section).forEach((row, index) => {
        const track = row.querySelector('.today-track')
        const distance = () => Math.max(0, track.scrollWidth - row.clientWidth)
        gsap.fromTo(
          track,
          { x: () => (index % 2 ? -distance() : 0) },
          {
            x: () => (index % 2 ? 0 : -distance()),
            ease: 'none',
            scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
          },
        )
      })
    },
    { scope: root, dependencies: [live, lang], revertOnUpdate: true },
  )

  return (
    <section id="hoy" ref={root} className="section today on-ink" aria-labelledby="today-title" data-live={live ? '' : undefined}>
      <div className="container">
        <h2 id="today-title" className="giant today-title" style={{ '--em': 8.4 }}>
          <SplitWords text={t('todayTitle')} mask />
        </h2>
        <ul className="today-list">
          {capabilities.map((capability, index) => (
            <li key={capability.id} className="today-item">
              <span className="today-index label" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="today-name">{localize(capability.title, lang)}</h3>
              <p className="today-proof">{localize(capability.proof, lang)}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="today-strip" aria-hidden="true">
        {STRIPS.map((ids, row) => (
          <div key={row} className="today-strip-row" data-row={row}>
            <div className="today-track">
              {ids.map((id) => (
                <span key={id} className="today-tech">
                  {TECH[id].name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
