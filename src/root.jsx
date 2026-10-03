import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { Link, Links, Meta, Outlet, Scripts, ScrollRestoration, useLocation } from 'react-router'
import 'lenis/dist/lenis.css'
import './styles/tokens.css'
import './styles/global.css'
import './styles/pages.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Preloader from './components/Preloader'
import SceneLayer from './scene/SceneLayer'
import { loadScene } from './scene/loadScene'
import { useQualityTier } from './scene/useQualityTier'
import { useReducedMotion } from './hooks/useReducedMotion'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import { useMicroInteractions } from './hooks/useMicroInteractions'
import { useT } from './i18n/useLang'
import { loadImage } from './lib/loadImage'
import { ScrollTrigger } from './lib/gsap'
import { useSceneStore } from './store/sceneStore'

// Runs only in the browser (inside the preloader's effect), never during prerender.
const PRELOAD_TASKS = [
  () => document.fonts?.ready,
  () => loadImage(window.innerWidth < 768 ? '/img/portrait-540.webp' : '/img/portrait-1086.webp'),
  () => (useSceneStore.getState().tier === 'static' ? null : loadScene()),
]

// Without JavaScript (or if the bundle never loads) nothing would lift the preloader or play the hero:
// show the final hero composition instead. Hidden from React, which never hydrates <noscript> content.
const NO_SCRIPT_CSS = `
.preloader { display: none !important; }
.hero .hero-content { visibility: visible !important; }
.hero .hero-questions { display: flex; flex-direction: column; gap: 0.3rem; }
.hero .hero-q { opacity: 1 !important; max-width: none; font: 500 clamp(1rem, 1.5vw, 1.2rem) / 1.4 var(--font-body); color: var(--text-muted); }
.hero .hero-answer { position: relative !important; opacity: 1 !important; pointer-events: auto !important; }
.hero .hero-q .w-inner, .hero .hero-answer .w-inner { transform: none !important; animation: none !important; }
.hero .hero-answer::after { display: none; }
.hero .hero-body, .hero .hero-portrait { opacity: 1 !important; transform: none !important; pointer-events: auto !important; }
@media (max-width: 767px) { .hero .hero-portrait { opacity: 0.35 !important; } }
`

const noopSubscribe = () => () => {}

// false in the prerendered HTML and during hydration, true afterwards: lets the shell lock the page
// behind the preloader without baking `inert` into the static HTML.
const useHydrated = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )

export const links = () => [
  { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
  { rel: 'preconnect', href: 'https://api.fontshare.com', crossOrigin: 'anonymous' },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap',
  },
  { rel: 'stylesheet', href: 'https://api.fontshare.com/v2/css?f[]=clash-display@500,600,700&display=swap' },
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
        <noscript dangerouslySetInnerHTML={{ __html: `<style>${NO_SCRIPT_CSS}</style>` }} />
      </head>
      <body>
        {/* #root is the R3F event source: the canvas and the HTML both live inside it. */}
        <div id="root">{children}</div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export function HydrateFallback() {
  return (
    <div className="preloader" role="status" aria-busy="true">
      <p className="preloader-brand" aria-hidden="true">
        &lt;MDG /&gt;
      </p>
    </div>
  )
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
  const [ready, setReady] = useState(false)
  const handleLoaded = useCallback(() => setReady(true), [])
  const { pathname } = useLocation()
  const locked = useHydrated() && !ready

  useQualityTier()
  useSmoothScroll(ready && !reducedMotion)
  useMicroInteractions(ready && !reducedMotion)

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
      <SceneLayer reducedMotion={reducedMotion} />
      <Navbar ready={!locked} />
      <main id="main" inert={locked}>
        <Outlet context={{ ready, reducedMotion }} />
      </main>
      <Footer />
      <Preloader tasks={PRELOAD_TASKS} reducedMotion={reducedMotion} onDone={handleLoaded} />
    </>
  )
}
