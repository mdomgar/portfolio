import { FaGithub } from 'react-icons/fa'
import { FiExternalLink } from 'react-icons/fi'
import { projects } from '../data/projects'
import { TECH } from '../data/skills'
import { localize } from '../data/localize'
import { useLang, useT } from '../i18n/useLang'
import Reveal from './Reveal'
import SectionHeading from './SectionHeading'
import DashboardPreview from './DashboardPreview'
import './css/Projects.css'

export default function Projects({ reducedMotion }) {
  const lang = useLang()
  const t = useT()

  return (
    <section id="projects" className="section projects" aria-labelledby="projects-title">
      <div className="container">
        <SectionHeading id="projects-title" eyebrow="03" title={t('projectsTitle')} />
        {projects.map((project) => (
          <Reveal as="article" key={project.id} className="card project" data-tilt aria-labelledby={`${project.id}-title`}>
            <header className="project-header">
              <img
                src={project.logo.src}
                width={project.logo.width}
                height={project.logo.height}
                alt=""
                className="project-logo"
                loading="lazy"
              />
              <div>
                <p className="project-tag mono">{localize(project.tag, lang)}</p>
                <h3 id={`${project.id}-title`}>{project.title}</h3>
              </div>
            </header>
            <p className="project-summary">{localize(project.summary, lang)}</p>
            <DashboardPreview reducedMotion={reducedMotion} />
            <dl className="project-story">
              <div>
                <dt>{t('projectProblem')}</dt>
                <dd>{localize(project.problem, lang)}</dd>
              </div>
              <div>
                <dt>{t('projectSolution')}</dt>
                <dd>{localize(project.solution, lang)}</dd>
              </div>
            </dl>
            <ul className="project-stack" aria-label={t('projectStack')}>
              {project.stack.map((id) => {
                const tech = TECH[id]
                return (
                  <li key={id} className="chip">
                    <tech.Icon aria-hidden="true" style={{ color: tech.color }} />
                    {tech.name}
                  </li>
                )
              })}
            </ul>
            <div className="project-links">
              <a className="btn btn-primary" href={project.live} target="_blank" rel="noopener noreferrer">
                <FiExternalLink aria-hidden="true" />
                {t('projectLive')}
                <span className="sr-only"> · {project.title}</span>
              </a>
              <a className="btn" href={project.github} target="_blank" rel="noopener noreferrer">
                <FaGithub aria-hidden="true" />
                {t('projectCode')}
                <span className="sr-only"> · {project.title}</span>
              </a>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
