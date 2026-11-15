import { FaGithub, FaLinkedin } from 'react-icons/fa'
import { profile } from '../data/profile'
import { useT } from '../i18n/useLang'
import CopyEmailButton from './CopyEmailButton'
import './css/Contact.css'

export default function Contact() {
  const t = useT()

  return (
    <section id="contacto" className="section contact on-ink" aria-labelledby="contact-title">
      <div className="container">
        <h2 id="contact-title" className="giant" style={{ '--em': 5.8 }}>
          {t('contactTitle')}
        </h2>
        <p className="contact-lead">{t('contactLead')}</p>
        <div className="contact-actions">
          <CopyEmailButton email={profile.email} />
          <a className="btn" href={profile.linkedin} target="_blank" rel="noopener noreferrer">
            <FaLinkedin aria-hidden="true" />
            LinkedIn
          </a>
          <a className="btn" href={profile.github} target="_blank" rel="noopener noreferrer">
            <FaGithub aria-hidden="true" />
            GitHub
          </a>
        </div>
      </div>
    </section>
  )
}
