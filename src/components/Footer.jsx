import { Link } from 'react-router'
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
        <Link to="/aviso-legal">{t('footerLegal')}</Link>
      </div>
    </footer>
  )
}
