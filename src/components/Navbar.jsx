import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useT } from '../i18n/useLang'
import './css/Navbar.css'

export default function Navbar() {
  const t = useT()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`navbar${scrolled ? ' is-scrolled' : ''}`}>
      <a className="skip-link" href="#main">
        {t('skipToContent')}
      </a>
      <nav className="navbar-inner container" aria-label={t('navLabel')}>
        <Link className="navbar-brand" to="/" aria-label={t('brandLabel')}>
          <span aria-hidden="true">&lt;MDG /&gt;</span>
        </Link>
      </nav>
    </header>
  )
}
