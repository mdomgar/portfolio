import { useRef } from 'react'
import { localize } from '../data/localize'
import { profile } from '../data/profile'
import { TECH_GROUPS } from '../data/skills'
import { useHydrated } from '../hooks/useHydrated'
import { useLang, useT } from '../i18n/useLang'
import { gsap, useGSAP } from '../lib/gsap'
import SplitWords from './SplitWords'
import TechList from './TechList'
import './css/Background.css'

// Education and stack. One entrance, nothing heavy: the title and the education line rise word by word,
// each group's rule draws and its chips settle one after another, all scrubbed with the scroll.
export default function Background({ reducedMotion }) {
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
        section.querySelectorAll('.background-title .w-inner'),
        { yPercent: 115, rotation: 5 },
        { yPercent: 0, rotation: 0, stagger: 0.12, ease: 'power3.out', scrollTrigger: scrub(section, 'top 70%', 'top 15%') },
      )
      gsap.fromTo(
        section.querySelectorAll('.background-education .w-inner'),
        { yPercent: 110 },
        {
          yPercent: 0,
          stagger: 0.04,
          ease: 'power3.out',
          scrollTrigger: scrub(section.querySelector('.background-education'), 'top 92%', 'top 50%'),
        },
      )
      const groups = section.querySelector('.background-groups')
      gsap.fromTo(
        groups,
        { '--rule': 0 },
        { '--rule': 1, ease: 'none', scrollTrigger: scrub(groups, 'top 94%', 'top 70%') },
      )
      gsap.utils.toArray('.background-group', section).forEach((group) => {
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: scrub(group, 'top 94%', 'top 60%'),
        })
        tl.fromTo(
          group.querySelectorAll('.chip'),
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, stagger: 0.08, duration: 0.5, ease: 'power2.out' },
          0.15,
        )
      })
    },
    { scope: root, dependencies: [live, lang], revertOnUpdate: true },
  )

  return (
    <section id="formacion" ref={root} className="section background" aria-labelledby="background-title">
      <div className="container">
        <h2 id="background-title" className="background-title">
          <SplitWords text={t('backgroundTitle')} mask />
        </h2>
        <p className="background-education">
          <span className="sr-only">{localize(profile.about.education, lang)}</span>
          <span aria-hidden="true">
            <SplitWords text={localize(profile.about.education, lang)} mask />
          </span>
        </p>
        <div className="background-groups">
          {TECH_GROUPS.map((group) => {
            const title = localize(group.title, lang)
            return (
              <div key={group.id} className="background-group">
                <p className="label background-group-title" aria-hidden="true">
                  {title}
                </p>
                <TechList ids={group.ids} label={title} />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
