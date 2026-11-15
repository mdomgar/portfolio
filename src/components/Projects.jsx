import { Link } from 'react-router'
import { FaGithub } from 'react-icons/fa'
import { FiExternalLink } from 'react-icons/fi'
import { getCase } from '../data/cases'
import { localize } from '../data/localize'
import { projects } from '../data/projects'
import { useLang, useT } from '../i18n/useLang'
import ScreenPreview from './ScreenPreview'
import TechList from './TechList'
import './css/Projects.css'

function LiveProject({ project, reducedMotion }) {
  const lang = useLang()
  const t = useT()
  const item = getCase(project.caseSlug)

  return (
    <article className="project project-live" aria-labelledby={`project-${project.id}`}>
      <div className="project-copy">
        <p className="project-label label">{localize(item.label, lang)}</p>
        <h3 id={`project-${project.id}`} className="giant project-name">
          {item.name}
        </h3>
        <p className="project-tagline">{localize(item.tagline, lang)}</p>
        <TechList ids={item.stack} label={t('caseStack')} />
        <div className="project-links">
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
      <figure className="project-figure">
        <ScreenPreview screen={item.preview} reducedMotion={reducedMotion} />
      </figure>
    </article>
  )
}

// Vulcania belongs to a client: text only, no link, no image.
function BuildingProject({ project }) {
  const lang = useLang()

  return (
    <div className="project project-building">
      <h3 className="project-building-name">{project.name}</h3>
      <p className="project-building-summary">{localize(project.summary, lang)}</p>
      <p className="project-status label">{localize(project.statusLabel, lang)}</p>
    </div>
  )
}

export default function Projects({ reducedMotion }) {
  const t = useT()

  return (
    <section id="proyectos" className="section projects" aria-labelledby="projects-title">
      <div className="container">
        <h2 id="projects-title" className="giant" style={{ '--em': 6.4 }}>
          {t('projectsTitle')}
        </h2>
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
      </div>
    </section>
  )
}
