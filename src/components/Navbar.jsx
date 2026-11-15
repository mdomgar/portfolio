import { Link } from 'react-router'
import { profile } from '../data/profile'
import { useT } from '../i18n/useLang'
import './css/Navbar.css'

// Under 768 px only "Contacto" stays: the others hide with CSS, so the DOM is the same everywhere.
const LINKS = [
  { hash: '#trayectoria', key: 'navActs', short: false },
  { hash: '#proyectos', key: 'navProjects', short: false },
  { hash: '#contacto', key: 'navContact', short: true },
]

export default function Navbar() {
  const t = useT()

  return (
    <header className="navbar">
      <a className="skip-link" href="#main">
        {t('skipToContent')}
      </a>
      <nav className="navbar-inner container" aria-label={t('navLabel')}>
        <Link className="navbar-brand" to="/" aria-label={t('brandLabel')}>
          <span aria-hidden="true">{profile.shortName}</span>
        </Link>
        <ul className="navbar-links">
          {LINKS.map(({ hash, key, short }) => (
            <li key={hash} className={short ? undefined : 'navbar-optional'}>
              <Link to={{ pathname: '/', hash }}>{t(key)}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
