import { FaGithub, FaLinkedin } from 'react-icons/fa'
import { FiMail } from 'react-icons/fi'
import { profile } from '../data/profile'
import { useT } from '../i18n/useLang'
import Reveal from './Reveal'
import CopyEmailButton from './CopyEmailButton'
import './css/Contact.css'

export default function Contact() {
  const t = useT()

  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title">
      <Reveal className="container contact-inner">
        <p className="section-eyebrow" aria-hidden="true">
          05
        </p>
        <h2 id="contact-title" className="contact-title">
          {t('contactTitle')}
        </h2>
        <p className="contact-text">{t('contactText')}</p>
        <CopyEmailButton email={profile.email} />
        <ul className="contact-links">
          <li>
            <a className="btn" href={`mailto:${profile.email}`}>
              <FiMail aria-hidden="true" />
              {t('writeEmail')}
            </a>
          </li>
          <li>
            <a className="btn" href={profile.linkedin} target="_blank" rel="noopener noreferrer">
              <FaLinkedin aria-hidden="true" />
              LinkedIn
            </a>
          </li>
          <li>
            <a className="btn" href={profile.github} target="_blank" rel="noopener noreferrer">
              <FaGithub aria-hidden="true" />
              GitHub
            </a>
          </li>
        </ul>
      </Reveal>
    </section>
  )
}
