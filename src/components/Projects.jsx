import { useRef } from 'react'
import { Link } from 'react-router'
import { FaGithub } from 'react-icons/fa'
import { FiExternalLink } from 'react-icons/fi'
import { getCase } from '../data/cases'
import { localize } from '../data/localize'
import { projects } from '../data/projects'
import { useHydrated } from '../hooks/useHydrated'
import { useLang, useT } from '../i18n/useLang'
import { gsap, useGSAP } from '../lib/gsap'
import DeviceFrame from './DeviceFrame'
import ScreenPreview from './ScreenPreview'
import SplitLetters from './SplitLetters'
import TechList from './TechList'
import './css/Projects.css'

function LiveProject({ project, reducedMotion }) {
  const lang = useLang()
  const t = useT()
  const hydrated = useHydrated()
  const live = hydrated && !reducedMotion
  const root = useRef(null)
  const item = getCase(project.caseSlug)

  useGSAP(
    () => {
      if (!live) return
      const block = root.current
      const scrub = (trigger, start, end) => ({ trigger, start, end, scrub: 0.6, invalidateOnRefresh: true })

      // The name: letter by letter, each rising out of its mask.
      gsap.fromTo(
        block.querySelectorAll('.solar-name .l-inner'),
        { yPercent: 118, rotation: 7 },
        {
          yPercent: 0,
          rotation: 0,
          stagger: 0.07,
          ease: 'power3.out',
          scrollTrigger: scrub(block, 'top 85%', 'top 12%'),
        },
      )

      // The window: tips in from the side and settles flat; its plate slides out from behind it and the
      // chrome draws itself (dots pop, the address bar runs across).
      const entry = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: scrub(block.querySelector('.solar-body'), 'top 95%', 'top 58%'),
      })
      entry
        .fromTo(
          block.querySelector('.device'),
          { scale: 0.8, rotation: -5, yPercent: 14, transformOrigin: '30% 80%' },
          { scale: 1, rotation: 0, yPercent: 0, duration: 1, ease: 'power2.out' },
          0,
        )
        .fromTo(block.querySelector('.device-plate'), { x: -28, y: -28 }, { x: 0, y: 0, duration: 0.8 }, 0.2)
        .fromTo(
          block.querySelectorAll('.device-dot'),
          { scale: 0 },
          { scale: 1, stagger: 0.1, duration: 0.25, ease: 'back.out(2.5)' },
          0.3,
        )
        .fromTo(block.querySelector('.device-url'), { scaleX: 0 }, { scaleX: 1, duration: 0.5 }, 0.55)
        .fromTo(
          block.querySelector('.device-window'),
          { clipPath: 'inset(0 0 100% 0)' },
          { clipPath: 'inset(0 0 0% 0)', duration: 0.7 },
          0.15,
        )

      // The copy settles line by line.
      gsap.fromTo(
        block.querySelectorAll('.solar-reveal'),
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.12,
          ease: 'power2.out',
          scrollTrigger: scrub(block.querySelector('.solar-copy'), 'top 92%', 'top 62%'),
        },
      )

      // Pointer: the window leans towards the cursor. Fine pointers only.
      const figure = block.querySelector('.solar-figure')
      const tilt = block.querySelector('.device-tilt')
      const mm = gsap.matchMedia()
      mm.add('(hover: hover) and (pointer: fine)', () => {
        const rx = gsap.quickTo(tilt, 'rotationX', { duration: 0.7, ease: 'power3.out' })
        const ry = gsap.quickTo(tilt, 'rotationY', { duration: 0.7, ease: 'power3.out' })
        const move = (event) => {
          const rect = figure.getBoundingClientRect()
          const nx = ((event.clientX - rect.left) / rect.width - 0.5) * 2
          const ny = ((event.clientY - rect.top) / rect.height - 0.5) * 2
          ry(Math.max(-1, Math.min(1, nx)) * 6)
          rx(Math.max(-1, Math.min(1, ny)) * -5)
        }
        const leave = () => {
          rx(0)
          ry(0)
        }
        block.addEventListener('pointermove', move)
        block.addEventListener('pointerleave', leave)
        return () => {
          block.removeEventListener('pointermove', move)
          block.removeEventListener('pointerleave', leave)
        }
      })
    },
    { scope: root, dependencies: [live, lang], revertOnUpdate: true },
  )

  return (
    <article ref={root} className="solar" style={{ '--block': item.color }} aria-labelledby={`project-${project.id}`}>
      <div className="container solar-inner">
        <div className="solar-top">
          <h2 id="projects-title" className="solar-kicker">
            {t('projectsTitle')}
          </h2>
          <p className="solar-label label">{localize(item.label, lang)}</p>
        </div>
        <h3 id={`project-${project.id}`} className="giant solar-name" style={{ '--em': 7.95 }}>
          <SplitLetters text={item.name} />
        </h3>
        <div className="solar-body">
          <div className="solar-copy">
            <p className="solar-tagline solar-reveal">{localize(item.tagline, lang)}</p>
            <p className="solar-highlight solar-reveal">{localize(item.highlight, lang)}</p>
            <div className="solar-reveal">
              <TechList ids={item.stack} label={t('caseStack')} />
            </div>
            <div className="solar-links solar-reveal">
              <Link className="btn btn-primary" to={`/casos/${project.caseSlug}`}>
                {t('projectCase')}
                <span className="sr-only"> · {item.name}</span>
              </Link>
              <a className="btn" href={item.links.demo} target="_blank" rel="noopener noreferrer">
                <FiExternalLink aria-hidden="true" />
                {t('caseDemo')}
                <span className="sr-only"> · {item.name}</span>
              </a>
              <a className="btn" href={item.links.code} target="_blank" rel="noopener noreferrer">
                <FaGithub aria-hidden="true" />
                {t('caseCode')}
                <span className="sr-only"> · {item.name}</span>
              </a>
            </div>
          </div>
          <figure className="solar-figure">
            <DeviceFrame>
              <ScreenPreview screen={item.preview} reducedMotion={reducedMotion} />
            </DeviceFrame>
          </figure>
        </div>
      </div>
    </article>
  )
}

// Vulcania belongs to a client: text only, no link, no image. Drawn dashed and hatched: not ready yet.
function BuildingProject({ project }) {
  const lang = useLang()

  return (
    <div className="container">
      <div className="project-building">
        <h3 className="project-building-name">{project.name}</h3>
        <p className="project-building-summary">{localize(project.summary, lang)}</p>
        <p className="project-status label">{localize(project.statusLabel, lang)}</p>
      </div>
    </div>
  )
}

export default function Projects({ reducedMotion }) {
  return (
    <section id="proyectos" className="section projects" aria-labelledby="projects-title">
      <ul className="projects-list">
        {projects.map((project) => (
          <li key={project.id}>
            {project.status === 'live' ? (
              <LiveProject project={project} reducedMotion={reducedMotion} />
            ) : (
              <BuildingProject project={project} />
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
