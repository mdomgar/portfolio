import { useEffect } from 'react'
import { Link, Links, Meta, Outlet, Scripts, ScrollRestoration, useLocation } from 'react-router'
import 'lenis/dist/lenis.css'
import './styles/fonts.css'
import './styles/tokens.css'
import './styles/global.css'
import './styles/pages.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { useReducedMotion } from './hooks/useReducedMotion'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import { useT } from './i18n/useLang'
import { ScrollTrigger } from './lib/gsap'

export const links = () => [
  { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
  // Self-hosted fonts (styles/fonts.css). Every page needs the body text.
  { rel: 'preload', href: '/fonts/inter-latin-var.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
]

export function Layout({ children }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#07080d" />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="root">{children}</div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export function HydrateFallback() {
  return null
}

export function ErrorBoundary() {
  const t = useT()
  return (
    <main id="main" className="section page-simple">
      <div className="container">
        <h1>{t('errorTitle')}</h1>
        <p>{t('errorText')}</p>
        <Link className="btn btn-primary" to="/">
          {t('backHome')}
        </Link>
      </div>
    </main>
  )
}

export default function App() {
  const reducedMotion = useReducedMotion()
  const { pathname } = useLocation()

  useSmoothScroll(!reducedMotion)

  useEffect(() => {
    // A new page means new trigger positions (pins, scroll-linked effects). Only refresh when the page
    // has triggers: with none, refresh() just restores the scroll it recorded on the previous page, which
    // left a case page opened from the home (reduced motion) part-way down.
    const frame = requestAnimationFrame(() => {
      if (ScrollTrigger.getAll().length) ScrollTrigger.refresh()
    })
    return () => cancelAnimationFrame(frame)
  }, [pathname])

  return (
    <>
      <Navbar />
      <main id="main">
        <Outlet context={{ reducedMotion }} />
      </main>
      <Footer />
    </>
  )
}
