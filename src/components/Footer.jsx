import { profile } from '../data/profile'
import { useT } from '../i18n/useLang'
import './css/Footer.css'

export default function Footer() {
  const t = useT()

  return (
    <footer className="footer container">
      <p>
        © {new Date().getFullYear()} {profile.name}
      </p>
      <p className="mono">{t('footerBuilt')}</p>
    </footer>
  )
}
