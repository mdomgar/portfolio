import { Link } from 'react-router'
import { FaGithub, FaLinkedin } from 'react-icons/fa'
import { profile } from '../data/profile'
import { useT } from '../i18n/useLang'
import './css/Footer.css'

export default function Footer() {
  const t = useT()

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p>
          © {__BUILD_YEAR__} {profile.name}
        </p>
        <ul className="footer-links">
          <li>
            <Link to="/aviso-legal">{t('footerLegal')}</Link>
          </li>
          <li>
            <a href={profile.github} target="_blank" rel="noopener noreferrer">
              <FaGithub aria-hidden="true" />
              GitHub
            </a>
          </li>
          <li>
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
              <FaLinkedin aria-hidden="true" />
              LinkedIn
            </a>
          </li>
        </ul>
      </div>
    </footer>
  )
}
