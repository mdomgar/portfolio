import { useEffect, useState } from 'react'
import { SECTIONS } from '../data/sections'
import { localize } from '../data/localize'
import { useLang, useT } from '../i18n/useLang'
import { useSceneStore } from '../store/sceneStore'
import './css/Navbar.css'

const NAV_ITEMS = SECTIONS.filter((section) => section.id !== 'hero')

export default function Navbar({ ready = true }) {
  const lang = useLang()
  const t = useT()
  const active = useSceneStore((state) => state.section)
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
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
        <a href="#hero" className="navbar-brand" aria-label={`${localize(SECTIONS[0].label, lang)} · Miguel Ángel`}>
          <span aria-hidden="true">&lt;MDG /&gt;</span>
        </a>
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
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={active === item.id ? 'true' : undefined}
                onClick={() => setOpen(false)}
              >
                {localize(item.label, lang)}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
