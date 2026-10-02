import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import { NAV_ITEMS } from '../data/sections'
import { localize } from '../data/localize'
import { useLang, useT } from '../i18n/useLang'
import { useSceneStore } from '../store/sceneStore'
import SectionLink from './SectionLink'
import './css/Navbar.css'

const VISIBLE_ITEMS = NAV_ITEMS.filter((item) => item.enabled)

export default function Navbar({ ready = true }) {
  const lang = useLang()
  const t = useT()
  const { pathname } = useLocation()
  const section = useSceneStore((state) => state.section)
  const active = pathname.startsWith('/casos/') ? 'casos' : pathname === '/' ? section : null
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const close = () => setOpen(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className={`navbar${scrolled ? ' is-scrolled' : ''}`} inert={!ready}>
      <a className="skip-link" href="#main">
        {t('skipToContent')}
      </a>
      <nav className="navbar-inner container" aria-label={t('navLabel')}>
        <SectionLink id="hero" className="navbar-brand" aria-label={t('brandLabel')}>
          <span aria-hidden="true">&lt;MDG /&gt;</span>
        </SectionLink>
        <button
          type="button"
          className="navbar-toggle"
          aria-expanded={open}
          aria-controls="nav-menu"
          aria-label={open ? t('menuClose') : t('menuOpen')}
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
        </button>
        <ul id="nav-menu" className={`navbar-links${open ? ' is-open' : ''}`}>
          {VISIBLE_ITEMS.map((item) => (
            <li key={item.id}>
              <SectionLink id={item.id} aria-current={active === item.id ? 'true' : undefined} onClick={close}>
                {localize(item.label, lang)}
              </SectionLink>
            </li>
          ))}
          <li className="navbar-cta-item">
            <SectionLink id="brief" className="btn btn-primary navbar-cta" onClick={close}>
              {t('ctaBrief')}
            </SectionLink>
          </li>
        </ul>
      </nav>
    </header>
  )
}
