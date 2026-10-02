# Portfolio v2 — Fase A (Núcleo para clientes) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir el portfolio 3D de la fase 1 en una web para captar clientes: home nueva (hero en secuencia de preguntas, servicios con pin, casos, cómo trabajo, quién soy, ahora mismo, brief guiado), páginas de caso de SolarMetrics y Seenat, legal, 404, SEO por ruta y envío del brief con una Vercel Function + Resend, todo prerenderizado a HTML estático.

**Architecture:** React Router 7 en modo framework (plugin de Vite) con `ssr: false` + `prerender` de todas las rutas públicas: cada ruta sale como HTML estático en `build/client/` y se hidrata en cliente. El layout raíz (`src/root.jsx`) monta una sola vez `SceneLayer` (lienzo three.js perezoso, nunca en prerender), `Navbar`, `<Outlet/>`, `Footer` y el preloader, así que la escena persiste entre rutas. La cámara elige pose con `resolvePoseId({ section, sceneCue })`: el `sceneCue` que ponen la secuencia del hero y el pin de servicios manda sobre la sección visible. `/api/brief` es una Vercel Function (`export default { fetch }`) que valida con el mismo `src/lib/briefSchema.js` que el formulario y envía con Resend.

**Tech Stack:** React 19.2, Vite 7.2, React Router 7.18 (`react-router` + `@react-router/dev`), three 0.186, @react-three/fiber 9, drei 10, postprocessing, gsap 3.15 + ScrollTrigger + @gsap/react, lenis 1.3, zustand 5, react-icons 5, resend 6, Vitest 5 + jsdom + Testing Library, Playwright 1.63 (`@playwright/test`, Chrome del sistema), Lighthouse (`npx lighthouse`).

**Spec:** `docs/superpowers/specs/2026-10-01-portfolio-v2-design.md` (autoridad). Contexto: `docs/superpowers/research/2026-10-01-portfolio-content-research.md`. Plan anterior (estilo): `docs/superpowers/plans/2026-09-30-portfolio-3d-fase-1.md`.

## Desviaciones y decisiones fijadas (léelas antes de empezar)

1. **React Router 7.18.4, no 8.x.** `npm view react-router version` devuelve `8.4.0`, pero la decisión es RR7 y además RR8 exige Node ≥ 22.22 (aquí hay 22.12) y `react ≥ 19.2.7` (aquí 19.2.0). `@react-router/dev@7.18.4` declara `vite: ^5 || ^6 || ^7 || ^8` y Node ≥ 20: compatible con Vite 7. Se instala con rango `^7.18.4` (nunca sube a 8).
2. **404 real en Vercel:** se prerenderiza `/404` (la ruta comodín `*`) y el hook `buildEnd` de `react-router.config.js` lo copia a `build/client/404.html`, que Vercel sirve con estado 404 para cualquier URL desconocida.
3. **Vista previa local propia** (`scripts/serve-build.js`) en lugar de `vite preview`: imita a Vercel (`/ruta` → `ruta/index.html`, desconocido → `404.html` con estado 404, ignora la query `?scene=static`). Playwright y Lighthouse usan este servidor.
4. **`/api/brief`:** el handler vive en `server/briefHandler.js` (testeable con Resend inyectado); `api/brief.js` solo lo conecta. Códigos extra no listados en el spec: `405` (método ≠ POST, con `Allow: POST`) y `413 {error:'too_large'}` (> 10 KB). Trampa rellena o envío en < 3 s → `400 {error:'invalid', fields: []}` sin enviar (no se finge éxito para no engañar a un humano con un falso positivo).
5. **Seenat: 163 pruebas, no 158.** El spec pide verificar contra el repo. `CLAUDE.md` de Seenat dice 158/158 al cerrar el plan 1, pero la suma actual de `plan(n)` en `supabase/tests/database/*.sql` es 7+10+18+20+19+14+18+27+14+16 = **163** (se añadieron pruebas después, migración `20260930000100`). Se publica 163 con un comentario de procedencia; Miguel debe confirmarlo con `npx supabase test db` (checklist final).
6. **Privacidad:** además de Resend (encargado, como dice el spec) se nombra a Vercel como proveedor de alojamiento, porque la función procesa la petición. Miguel revisa ambos textos legales.
7. **Etiquetas rápidas del brief para "herramienta" y "app":** el spec solo da las de web; las de herramienta/app son copy nuevo (marcado para que Miguel lo revise).
8. **Aviso legal:** la LSSI pide NIF y domicilio; no los tenemos. `profile.legal.nif` queda `null` y la fila no se pinta hasta que Miguel lo rellene (checklist final). No se inventa nada.

## Global Constraints

- Rama `portfolio-v2` en el worktree `C:/Users/Mikel/Documents/React/portfolio/.claude/worktrees/portfolio-v2`. Commits pequeños por tarea; **todo mensaje de commit termina exactamente con** `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Nunca tocar `lint_output.txt` (sin seguimiento). Nunca hacer commit de `.claude/`, `scripts/.venv/`, JSON de Lighthouse, `dist/`, `build/`, `.react-router/`, `playwright-report/`, `test-results/`. Usar `git add` con rutas explícitas, nunca `git add .` / `-A`.
- Al final de **cada** tarea: `npm test`, `npm run lint` y `npm run build` en verde.
- three.js nunca en el chunk inicial ni ejecutado en prerender: `SceneCanvas` solo por `import()` perezoso y solo cuando `tier` está definido (el tier se detecta en cliente). Comprobación: ningún `.js` que referencie `build/client/index.html` contiene `__THREE_DEVTOOLS__` (comando en la Tarea 1, Paso 12).
- Todo texto visible en `src/data/*` o `src/i18n/strings.js` como `{ es, en }`. La fase A pinta solo español (`useLang()` devuelve `'es'`). El copy español del spec se copia **literal**.
- Paleta Midnight neon (`--bg #07080d`, `--surface #131722`, `--accent #00e5ff`, `--accent-2 #7c5cff`, `--warm #ffb454`, `--text #e8ecf4`, `--text-muted #8a93a6`) y tipografías (Clash Display / Inter / JetBrains Mono) sin cambios.
- Movimiento (spec §7, principios de Emil Kowalski): `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`, `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)`, `--dur-press: 140ms`, `--dur-ui: 220ms`, `--dur-panel: 400ms`. Interfaz < 300 ms; solo hero, cámara y transición de caso pueden durar más. Solo se animan `transform`, `opacity`, `clip-path` y `filter` (blur ≤ 8px). Nada sale de `scale(0)` (mínimo 0.95 + opacidad). Hover solo dentro de `@media (hover: hover) and (pointer: fine)`; `:active` con `scale(0.97)` en todo lo pulsable. Escalonados 30–60 ms. Acciones de teclado sin animación. GSAP + ScrollTrigger para scroll y pins; transiciones CSS para interfaz.
- Reduced motion: se mantienen fundidos y cambios de color; fuera desplazamientos, pins, vuelos de cámara y lectura ligada al scroll.
- Sin precios, sin pregunta de presupuesto, sin disponibilidad publicada, sin porcentajes de habilidad, sin cifras inventadas. Proyectos con etiqueta honesta (`Proyecto de fin de grado`, `En desarrollo`).
- Sobre Macrosad solo se describe qué hace Miguel; nunca capturas, nombres de herramientas internas ni datos.
- Lab: la sección y el enlace no se renderizan en fase A (queda el hueco `enabled: false` en `NAV_ITEMS`).
- Ningún paso crea cuentas, despliega ni descarga navegadores. Playwright usa `channel: 'chrome'` (Chrome del sistema en `C:/Program Files/Google/Chrome/Application/chrome.exe`).
- Tests: Vitest + Testing Library con los mocks existentes (`src/test/mocks.js`: `mockMatchMedia`, `MockIntersectionObserver`; `getContext` devuelve `null` en `src/test/setup.js`). Store reseteado con `useSceneStore.setState(useSceneStore.getInitialState(), true)`.

## Review Focus

1. **`sessionStorage` bloqueado o lanzando excepciones** (Safari privado, cookies desactivadas): el hero debe hacer su secuencia y el brief debe funcionar sin borrador, sin romper. Tests: Tarea 6 (`useHeroSequence` con `getItem`/`setItem` que lanzan) y Tarea 13 (`briefDraft` con almacenamiento que lanza).
2. **Entrada directa, recarga o URL desconocida en rutas profundas** (`/casos/seenat`, `/casos/no-existe`, `/privacidad`): cada ruta pública llega prerenderizada con su `<title>`; lo desconocido devuelve la página 404 con estado 404. Tests: Tarea 1 (build + `curl` al servidor de vista previa) y Tarea 18 (e2e de títulos y 404).
3. **Doble clic en "Enviar" o reintento tras fallo:** nunca se manda el brief dos veces a la vez y los datos sobreviven al error. Test: Tarea 14 (dos clics → `fetch` una vez; 500 → Reintentar → éxito).
4. **Texto pegado con HTML, emojis o muy largo en el brief:** los límites cuentan caracteres reales (puntos de código) y el correo escapa todo. Tests: Tarea 11 (2000 emojis válidos, 2001 no) y Tarea 12 (`<script>` escapado en el HTML, cuerpo > 10 KB → 413).
5. **Ir y volver entre rutas con la escena persistente:** al salir del hero o de servicios se suelta su `sceneCue` (sin pisar el de otro), y volver a la home en la misma sesión empieza en el momento 4. Tests: Tarea 4 (`releaseSceneCue` solo suelta el suyo), Tarea 6 (`useSceneCue` —que usan el hero y servicios— cambia y suelta solo su cue al desmontar; desmontar el hero deja `sceneCue` en `null`) y Tarea 18 (e2e home → caso → atrás).

---

## Mapa de archivos

```
react-router.config.js            appDirectory 'src', ssr:false, prerender, buildEnd (404.html, sitemap, robots)
vite.config.js                    reactRouter() en build/dev, @vitejs/plugin-react en Vitest
vercel.json                       salida build/client, función api/brief.js
playwright.config.js, e2e/*.spec.js
scripts/serve-build.js            servidor estático tipo Vercel (vista previa, e2e, Lighthouse)
scripts/og-images.js              genera public/img/og-<caso>.jpg con Playwright + Chrome del sistema
api/brief.js                      Vercel Function (fetch) → server/briefHandler.js
server/briefHandler.js            validación, antispam, límite por IP, correo, Resend inyectado
src/root.jsx                      Layout <html>, App (escena + navbar + outlet + footer + preloader), ErrorBoundary
src/routes.js                     configuración de rutas
src/routes/                       home, case, privacy, legal, not-found
src/data/                         site, seo, profile, services, process, now, experience, cases/{index,solarmetrics,seenat}, brief, legal, sections, skills, localize
src/lib/                          siteUrl, seo, sitemap, briefSchema, briefState, briefDraft, briefClient, escapeHtml, format, gsap, clipboard, loadImage
src/store/sceneStore.js           section, sceneCue, tier, lampOn
src/scene/poses.js                CAMERA_POSES, SECTION_POSES, DIMMED_POSES, resolvePoseId, mainScreenFor, isPhoneLit (sin three)
src/scene/screens/                code, terminal, dashboard, solar, siteBuild, seenat, index (registro SCREENS)
src/scene/props/                  + Phone, Notebook
src/hooks/                        + useHeroSequence, useSceneCue, useMediaQuery, usePageScene
src/components/                   Hero, Services, Cases, Process, WhoAmI, Now, Brief, CaseStudy, LegalPage, OwnerDetails, ScreenPreview, SplitWords, TechList, SectionLink (+ existentes que se conservan)
```

Se eliminan: `index.html`, `src/main.jsx`, `src/App.jsx`, `src/components/{About,Experience,Education,Projects,Contact,CountUp,DashboardPreview}.jsx` con sus tests y CSS, `src/hooks/useTypewriter.js` (+ test), `src/data/{projects,education}.js`, `public/robots.txt` (pasa a generarse en build).

## Índice de tareas

| # | Tarea | Tipo |
|---|---|---|
| 1 | Migración a React Router 7 con prerender (la home de la fase 1 sigue funcionando) | Integración |
| 2 | Contenido v2 en datos bilingües | Transcripción |
| 3 | Pantallas `site-build` y `seenat`, registro `SCREENS`, `ScreenPreview` | Transcripción |
| 4 | Escena v2: `sceneCue`, poses, móvil y libreta | Mixto (ajuste visual) |
| 5 | Tokens de movimiento, Navbar v2, pie, escena por página | Transcripción + visual ligera |
| 6 | Hero en secuencia de preguntas | Integración + visual |
| 7 | Servicios con pin | Integración + visual |
| 8 | Casos en la home | Transcripción + visual ligera |
| 9 | Cómo trabajo | Transcripción + visual ligera |
| 10 | Quién soy y Ahora mismo | Integración + visual |
| 11 | Esquema compartido del brief | Transcripción |
| 12 | `/api/brief` con Resend | Transcripción |
| 13 | Estado, borrador y cliente del brief | Transcripción |
| 14 | Brief guiado (UI) | Integración + visual |
| 15 | Páginas de caso y transición compartida | Integración |
| 16 | Páginas legales | Transcripción |
| 17 | JSON-LD, sitemap, robots, imágenes OG | Integración |
| 18 | E2E con Playwright | Integración |
| 19 | Verificación final, README, lista de Miguel | Verificación |

---

### Task 1: Migración a React Router 7 (modo framework) con prerender

> **Tipo:** integración (requiere juicio: build, prerender y chunk check). Modelo capaz.

**Files:**
- Modify: `package.json`, `vite.config.js`, `eslint.config.js`, `.gitignore`, `src/scene/useQualityTier.js`, `src/i18n/strings.js`
- Create: `react-router.config.js`, `vercel.json`, `scripts/serve-build.js`
- Create: `src/root.jsx`, `src/routes.js`, `src/routes/home.jsx`, `src/routes/not-found.jsx`, `src/styles/pages.css`
- Create: `src/data/site.js`, `src/data/seo.js`, `src/lib/siteUrl.js`, `src/lib/seo.js`, `src/test/router.jsx`
- Delete: `index.html`, `src/main.jsx`, `src/App.jsx`
- Test: `src/lib/seo.test.js`, `src/data/site.test.js`, `src/scene/useQualityTier.test.js`, `src/routes/home.test.jsx`, `src/routes/not-found.test.jsx`

**Interfaces:**
- Consumes: componentes y hooks existentes de la fase 1 (`Navbar`, `Hero`, `About`, `Experience`, `Projects`, `Education`, `Contact`, `Footer`, `Preloader`, `SceneLayer`, `loadScene`, `useReducedMotion`, `useSmoothScroll`, `useMicroInteractions`, `useActiveSection`, `SECTION_IDS`, `loadImage`, `useSceneStore`, `detectTier`, `readDeviceInfo`).
- Produces:
  - `src/root.jsx`: `Layout({ children })`, `links()`, `HydrateFallback()`, `ErrorBoundary()`, default `App`. `App` pasa a las rutas `useOutletContext()` → `{ ready: boolean, reducedMotion: boolean }`.
  - `src/data/site.js`: `NOT_FOUND_PATH = '/404'`, `PUBLIC_PATHS: string[]` (empieza en `'/'`), `PRERENDER_PATHS = [...PUBLIC_PATHS, NOT_FOUND_PATH]`.
  - `src/data/seo.js`: `getPageSeo(path, lang = 'es')` → `{ title, description, image?, noindex } | null`.
  - `src/lib/siteUrl.js`: `DEFAULT_SITE_URL`, `normalizeSiteUrl(value)` → URL sin barra final.
  - `src/lib/seo.js`: `SITE_URL`, `DEFAULT_OG_IMAGE = '/img/og-image.jpg'`, `absoluteUrl(path)`, `buildMeta({ title, description, path, image?, noindex?, type? })` → array de descriptores `meta` de React Router.
  - `src/test/router.jsx`: `renderWithRouter(ui, { route })` y `renderPage(Page, { path, route, context })`.
  - `useQualityTier()` detecta el tier en cliente (layout effect) si es `null`.
  - Scripts npm: `dev` = `react-router dev`, `build` = `react-router build`, `preview` = `node scripts/serve-build.js` (puerto 4173).

- [ ] **Step 1: Instalar React Router 7**

```bash
npm install react-router@^7.18.4
npm install -D @react-router/dev@^7.18.4 @react-router/node@^7.18.4
npm ls react-router @react-router/dev vite react
```

Expected: `react-router@7.18.x`, `@react-router/dev@7.18.x`, `vite@7.2.x`, `react@19.2.x`, sin `ERESOLVE`. Si npm propone una 8.x, el rango está mal: debe ser `^7.18.4`. Nunca `--force`.

- [ ] **Step 2: Scripts de `package.json`** — sustituir el bloque `"scripts"` por:

```json
  "scripts": {
    "dev": "react-router dev",
    "build": "react-router build",
    "lint": "eslint .",
    "preview": "node scripts/serve-build.js",
    "test": "vitest run",
    "test:watch": "vitest"
  },
```

- [ ] **Step 3: Escribir los tests que fallan**

`src/lib/seo.test.js`:

```js
import { describe, expect, it } from 'vitest'
import { absoluteUrl, buildMeta, SITE_URL } from './seo'
import { DEFAULT_SITE_URL, normalizeSiteUrl } from './siteUrl'

describe('normalizeSiteUrl', () => {
  it('drops trailing slashes and falls back to the default domain', () => {
    expect(normalizeSiteUrl('https://example.dev///')).toBe('https://example.dev')
    expect(normalizeSiteUrl('  ')).toBe(DEFAULT_SITE_URL)
    expect(normalizeSiteUrl(undefined)).toBe(DEFAULT_SITE_URL)
  })
})

describe('buildMeta', () => {
  const meta = buildMeta({ title: 'Título', description: 'Descripción', path: '/casos/x' })
  const find = (key, value) => meta.find((entry) => entry[key] === value)

  it('sets the title, description, canonical and social tags', () => {
    expect(meta[0]).toEqual({ title: 'Título' })
    expect(find('name', 'description').content).toBe('Descripción')
    expect(find('rel', 'canonical').href).toBe(`${SITE_URL}/casos/x`)
    expect(find('property', 'og:url').content).toBe(`${SITE_URL}/casos/x`)
    expect(find('property', 'og:title').content).toBe('Título')
    expect(find('property', 'og:image').content).toBe(`${SITE_URL}/img/og-image.jpg`)
    expect(find('name', 'twitter:card').content).toBe('summary_large_image')
    expect(find('name', 'robots')).toBeUndefined()
  })

  it('keeps the trailing slash only for the home page', () => {
    expect(absoluteUrl('/')).toBe(`${SITE_URL}/`)
    expect(absoluteUrl('/privacidad')).toBe(`${SITE_URL}/privacidad`)
  })

  it('accepts a page-specific social image', () => {
    const custom = buildMeta({ title: 'T', description: 'D', path: '/', image: '/img/og-seenat.jpg' })
    expect(custom.find((entry) => entry.property === 'og:image').content).toBe(`${SITE_URL}/img/og-seenat.jpg`)
  })

  it('marks pages as noindex and leaves out the canonical', () => {
    const notFound = buildMeta({ title: '404', description: 'No existe', path: '/404', noindex: true })
    expect(notFound.find((entry) => entry.name === 'robots').content).toBe('noindex')
    expect(notFound.find((entry) => entry.rel === 'canonical')).toBeUndefined()
  })
})
```

`src/data/site.test.js`:

```js
import { describe, expect, it } from 'vitest'
import { NOT_FOUND_PATH, PRERENDER_PATHS, PUBLIC_PATHS } from './site'
import { getPageSeo } from './seo'

describe('site routes', () => {
  it('lists unique, clean, root-relative paths starting with the home page', () => {
    expect(PUBLIC_PATHS[0]).toBe('/')
    expect(new Set(PRERENDER_PATHS).size).toBe(PRERENDER_PATHS.length)
    for (const path of PRERENDER_PATHS) expect(path).toMatch(/^\/(?:[a-z0-9-]+(?:\/[a-z0-9-]+)*)?$/)
    expect(PUBLIC_PATHS).not.toContain(NOT_FOUND_PATH)
    expect(PRERENDER_PATHS).toContain(NOT_FOUND_PATH)
  })

  it('has unique SEO copy of a sensible length for every prerendered page, in both languages', () => {
    const titles = new Set()
    for (const path of PRERENDER_PATHS) {
      for (const lang of ['es', 'en']) {
        const seo = getPageSeo(path, lang)
        expect(seo, `${path} (${lang})`).toBeTruthy()
        expect(seo.title.length, path).toBeLessThanOrEqual(70)
        expect(seo.description.length, path).toBeGreaterThanOrEqual(50)
        expect(seo.description.length, path).toBeLessThanOrEqual(170)
      }
      titles.add(getPageSeo(path).title)
    }
    expect(titles.size).toBe(PRERENDER_PATHS.length)
  })

  it('returns null for unknown pages', () => {
    expect(getPageSeo('/nope')).toBeNull()
  })
})
```

`src/scene/useQualityTier.test.js`:

```js
import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useSceneStore } from '../store/sceneStore'
import { useQualityTier } from './useQualityTier'

beforeEach(() => {
  useSceneStore.setState(useSceneStore.getInitialState(), true)
  delete document.documentElement.dataset.scene
})

describe('useQualityTier', () => {
  it('detects the tier on the client and exposes it on <html>', () => {
    const { result } = renderHook(() => useQualityTier())
    // jsdom has no WebGL (getContext → null), so detection lands on the static tier.
    expect(result.current).toBe('static')
    expect(document.documentElement.dataset.scene).toBe('static')
  })

  it('keeps a tier that is already known', () => {
    useSceneStore.getState().setTier('medium')
    renderHook(() => useQualityTier())
    expect(useSceneStore.getState().tier).toBe('medium')
    expect(document.documentElement.dataset.scene).toBe('live')
  })
})
```

`src/routes/home.test.jsx`:

```jsx
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderPage } from '../test/router'
import Home, { meta } from './home'

describe('home route', () => {
  it('renders the hero with the context from the root layout', async () => {
    renderPage(Home)
    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(document.getElementById('hero')).toBeInTheDocument()
  })

  it('declares its SEO tags', () => {
    const tags = meta()
    expect(tags[0].title).toMatch(/^Miguel Ángel Domínguez · /)
    expect(tags.find((tag) => tag.rel === 'canonical').href).toMatch(/\/$/)
  })
})
```

`src/routes/not-found.test.jsx`:

```jsx
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderPage } from '../test/router'
import NotFound, { meta } from './not-found'

describe('not-found route', () => {
  it('explains the page does not exist and links back home', async () => {
    renderPage(NotFound, { path: '*', route: '/no-existe' })
    expect(await screen.findByRole('heading', { level: 1, name: 'Esta página no existe' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/')
  })

  it('is never indexed', () => {
    expect(meta().find((tag) => tag.name === 'robots').content).toBe('noindex')
  })
})
```

- [ ] **Step 4: Ejecutar los tests y verlos fallar**

Run: `npx vitest run src/lib/seo.test.js src/data/site.test.js src/scene/useQualityTier.test.js src/routes`
Expected: FAIL — `Failed to resolve import "./seo"`, `"./site"`, `"../test/router"`, y `useQualityTier` devuelve `null`.

- [ ] **Step 5: Utilidades de URL y SEO**

`src/lib/siteUrl.js`:

```js
export const DEFAULT_SITE_URL = 'https://miandoga.vercel.app'

export function normalizeSiteUrl(value) {
  const url = typeof value === 'string' ? value.trim() : ''
  return (url || DEFAULT_SITE_URL).replace(/\/+$/, '')
}
```

`src/lib/seo.js`:

```js
import { normalizeSiteUrl } from './siteUrl'

// `import.meta.env` does not exist when Node scripts (Playwright, og-images) import this file.
const env = import.meta.env ?? {}

export const SITE_URL = normalizeSiteUrl(env.VITE_SITE_URL)
export const DEFAULT_OG_IMAGE = '/img/og-image.jpg'

export function absoluteUrl(path) {
  return path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`
}

export function buildMeta({ title, description, path, image = DEFAULT_OG_IMAGE, noindex = false, type = 'website' }) {
  const url = absoluteUrl(path)
  const imageUrl = absoluteUrl(image)
  return [
    { title },
    { name: 'description', content: description },
    ...(noindex ? [{ name: 'robots', content: 'noindex' }] : [{ tagName: 'link', rel: 'canonical', href: url }]),
    { property: 'og:type', content: type },
    { property: 'og:locale', content: 'es_ES' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    { property: 'og:image', content: imageUrl },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: imageUrl },
  ]
}
```

- [ ] **Step 6: Rutas públicas y copy SEO**

`src/data/site.js`:

```js
export const NOT_FOUND_PATH = '/404'

export const PUBLIC_PATHS = ['/']

export const PRERENDER_PATHS = [...PUBLIC_PATHS, NOT_FOUND_PATH]
```

`src/data/seo.js`:

```js
import { localize } from './localize.js'

const PAGES = {
  '/': {
    title: {
      es: 'Miguel Ángel Domínguez · Webs, herramientas y apps a medida',
      en: 'Miguel Ángel Domínguez · Custom websites, tools and apps',
    },
    description: {
      es: 'Desarrollador web en Jaén. Construyo webs para negocios, herramientas web personalizadas y apps móviles, de la idea al lanzamiento.',
      en: 'Web developer based in Jaén, Spain. I build websites for businesses, custom web tools and mobile apps, from idea to launch.',
    },
  },
  '/404': {
    title: { es: 'Página no encontrada · Miguel Ángel Domínguez', en: 'Page not found · Miguel Ángel Domínguez' },
    description: {
      es: 'La página que buscas no existe o se ha movido. Vuelve al inicio para ver mis servicios y casos.',
      en: 'The page you are looking for does not exist or has moved. Go back home to see my services and case studies.',
    },
    noindex: true,
  },
}

export function getPageSeo(path, lang = 'es') {
  const page = PAGES[path]
  if (!page) return null
  return {
    title: localize(page.title, lang),
    description: localize(page.description, lang),
    image: page.image,
    noindex: Boolean(page.noindex),
  }
}
```

- [ ] **Step 7: Configuración de Vite, React Router y Vercel**

`vite.config.js` (reemplazar entero). El plugin de React Router no funciona dentro de Vitest; en tests se usa `@vitejs/plugin-react`:

```js
import { configDefaults, defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { reactRouter } from '@react-router/dev/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [process.env.VITEST ? react() : reactRouter()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    css: false,
    exclude: [...configDefaults.exclude, 'e2e/**', 'build/**'],
  },
})
```

`react-router.config.js`:

```js
import { copyFile } from 'node:fs/promises'
import path from 'node:path'
import { NOT_FOUND_PATH, PRERENDER_PATHS } from './src/data/site.js'

export default {
  appDirectory: 'src',
  ssr: false,
  prerender: PRERENDER_PATHS,
  async buildEnd({ viteConfig, reactRouterConfig }) {
    const clientDir = path.resolve(viteConfig.root, reactRouterConfig.buildDirectory, 'client')
    // Vercel serves /404.html with a 404 status for any unknown URL.
    await copyFile(path.join(clientDir, NOT_FOUND_PATH.slice(1), 'index.html'), path.join(clientDir, '404.html'))
  },
}
```

`vercel.json`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": null,
  "buildCommand": "npm run build",
  "outputDirectory": "build/client",
  "cleanUrls": true,
  "trailingSlash": false
}
```

- [ ] **Step 8: Rutas, layout raíz y página 404**

`src/routes.js`:

```js
import { index, route } from '@react-router/dev/routes'

export default [index('routes/home.jsx'), route('*', 'routes/not-found.jsx')]
```

Añadir a `src/i18n/strings.js` (dentro del objeto `strings`, al final):

```js
  notFoundTitle: { es: 'Esta página no existe', en: "This page doesn't exist" },
  notFoundText: {
    es: 'Puede que el enlace esté roto o que la página se haya movido.',
    en: 'The link may be broken or the page may have moved.',
  },
  backHome: { es: 'Volver al inicio', en: 'Back to home' },
  errorTitle: { es: 'Algo ha fallado', en: 'Something went wrong' },
  errorText: { es: 'Recarga la página o vuelve al inicio.', en: 'Reload the page or go back home.' },
```

`src/styles/pages.css`:

```css
.page-simple {
  min-height: 70svh;
  padding-top: calc(var(--nav-h) + clamp(3rem, 10vh, 6rem));
}

.page-simple h1 {
  margin-block: 0.75rem 1rem;
  font-size: clamp(2.2rem, 6vw, 4rem);
}

.page-simple p {
  max-width: 60ch;
  margin-bottom: 1.5rem;
  color: var(--text-muted);
}
```

`src/root.jsx`:

```jsx
import { useCallback, useEffect, useState } from 'react'
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

  useQualityTier()
  useSmoothScroll(ready && !reducedMotion)
  useMicroInteractions(ready && !reducedMotion)

  useEffect(() => {
    // A new page means new trigger positions (pins, scroll-linked effects).
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(frame)
  }, [pathname])

  return (
    <>
      <SceneLayer reducedMotion={reducedMotion} />
      <Navbar ready={ready} />
      <main id="main" inert={!ready}>
        <Outlet context={{ ready, reducedMotion }} />
      </main>
      <Footer />
      <Preloader tasks={PRELOAD_TASKS} reducedMotion={reducedMotion} onDone={handleLoaded} />
    </>
  )
}
```

`src/routes/home.jsx` (de momento compone las secciones de la fase 1; las tareas siguientes las sustituyen):

```jsx
import { useOutletContext } from 'react-router'
import Hero from '../components/Hero'
import About from '../components/About'
import Experience from '../components/Experience'
import Projects from '../components/Projects'
import Education from '../components/Education'
import Contact from '../components/Contact'
import { useActiveSection } from '../hooks/useActiveSection'
import { SECTION_IDS } from '../data/sections'
import { getPageSeo } from '../data/seo'
import { buildMeta } from '../lib/seo'

export const meta = () => buildMeta({ path: '/', ...getPageSeo('/') })

export const links = () => [
  {
    rel: 'preload',
    as: 'image',
    href: '/img/portrait-1086.webp',
    imageSrcSet: '/img/portrait-540.webp 540w, /img/portrait-1086.webp 1086w',
    imageSizes: '(max-width: 768px) 78vw, 520px',
    fetchPriority: 'high',
  },
]

export default function Home() {
  const { ready, reducedMotion } = useOutletContext()
  useActiveSection(SECTION_IDS)

  return (
    <>
      <Hero ready={ready} reducedMotion={reducedMotion} />
      <About reducedMotion={reducedMotion} />
      <Experience reducedMotion={reducedMotion} />
      <Projects reducedMotion={reducedMotion} />
      <Education />
      <Contact />
    </>
  )
}
```

`src/routes/not-found.jsx`:

```jsx
import { Link } from 'react-router'
import { useT } from '../i18n/useLang'
import { getPageSeo } from '../data/seo'
import { NOT_FOUND_PATH } from '../data/site'
import { buildMeta } from '../lib/seo'

export const meta = () => buildMeta({ path: NOT_FOUND_PATH, ...getPageSeo(NOT_FOUND_PATH) })

export default function NotFound() {
  const t = useT()
  return (
    <section className="section page-simple" aria-labelledby="not-found-title">
      <div className="container">
        <p className="section-eyebrow" aria-hidden="true">
          404
        </p>
        <h1 id="not-found-title">{t('notFoundTitle')}</h1>
        <p>{t('notFoundText')}</p>
        <Link className="btn btn-primary" to="/">
          {t('backHome')}
        </Link>
      </div>
    </section>
  )
}
```

- [ ] **Step 9: Detección del tier en cliente, helper de router y borrado de la entrada antigua**

`src/scene/useQualityTier.js` (reemplazar entero):

```js
import { useEffect, useLayoutEffect } from 'react'
import { useSceneStore } from '../store/sceneStore'
import { detectTier, readDeviceInfo } from './quality'

export function useQualityTier() {
  const tier = useSceneStore((state) => state.tier)
  const setTier = useSceneStore((state) => state.setTier)

  // Layout effect: runs in the browser only (never in prerender) and before any passive
  // effect, so the preloader already sees the tier when it decides whether to load three.js.
  useLayoutEffect(() => {
    if (useSceneStore.getState().tier === null) setTier(detectTier(readDeviceInfo()))
  }, [setTier])

  useEffect(() => {
    if (tier) document.documentElement.dataset.scene = tier === 'static' ? 'static' : 'live'
  }, [tier])

  return tier
}
```

`src/test/router.jsx`:

```jsx
import { render } from '@testing-library/react'
import { createRoutesStub, MemoryRouter, Outlet } from 'react-router'

export function renderWithRouter(ui, { route = '/' } = {}) {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>)
}

// Renders a route module the way root.jsx does: inside an <Outlet> that provides { ready, reducedMotion }.
export function renderPage(Page, { path = '/', route = path === '*' ? '/' : path, context } = {}) {
  const outletContext = context ?? { ready: true, reducedMotion: true }
  function Shell() {
    return <Outlet context={outletContext} />
  }
  const Stub = createRoutesStub([{ Component: Shell, children: [{ path, Component: Page }] }])
  return render(<Stub initialEntries={[route]} />)
}
```

Borrar la entrada antigua (su contenido ya vive en `src/root.jsx` y `src/routes/home.jsx`):

```bash
git rm index.html src/main.jsx src/App.jsx
```

- [ ] **Step 10: ESLint, `.gitignore` y servidor de vista previa**

`eslint.config.js` (reemplazar entero):

```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'build', '.react-router', 'playwright-report', 'test-results']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [js.configs.recommended, reactHooks.configs['recommended-latest'], reactRefresh.configs.vite],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^[A-Z_]' }],
    },
  },
  {
    // React Router route modules export these alongside the component.
    files: ['src/root.jsx', 'src/routes/**/*.jsx'],
    rules: {
      'react-refresh/only-export-components': [
        'error',
        { allowConstantExport: true, allowExportNames: ['meta', 'links', 'Layout', 'HydrateFallback', 'ErrorBoundary'] },
      ],
    },
  },
  {
    files: ['src/test/**/*.{js,jsx}', '**/*.test.{js,jsx}'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  {
    files: ['*.config.js', 'api/**/*.js', 'server/**/*.js', 'scripts/**/*.js'],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    // Playwright specs run in Node but pass callbacks to page.evaluate(), which run in the browser.
    files: ['e2e/**/*.js'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
])
```

`.gitignore`: añadir al final:

```
# React Router / Playwright
build
.react-router
playwright-report
test-results
```

`scripts/serve-build.js`:

```js
// Serves build/client the way Vercel does: /path → path/index.html, unknown → 404.html with status 404.
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('../build/client/', import.meta.url))
const PORT = Number(process.env.PORT) || 4173
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}

async function isFile(file) {
  try {
    return (await stat(file)).isFile()
  } catch {
    return false
  }
}

async function resolveFile(pathname) {
  const relative = path.normalize(decodeURIComponent(pathname)).replace(/^[/\\]+/, '')
  const target = path.join(ROOT, relative)
  if (!target.startsWith(ROOT)) return null
  for (const candidate of [target, path.join(target, 'index.html'), `${target}.html`]) {
    if (await isFile(candidate)) return candidate
  }
  return null
}

createServer(async (request, response) => {
  try {
    const { pathname } = new URL(request.url, 'http://localhost')
    const file = await resolveFile(pathname)
    const body = file ?? path.join(ROOT, '404.html')
    response.writeHead(file ? 200 : 404, { 'Content-Type': TYPES[path.extname(body)] ?? 'application/octet-stream' })
    createReadStream(body).pipe(response)
  } catch {
    response.writeHead(400).end()
  }
}).listen(PORT, () => {
  console.log(`build/client → http://localhost:${PORT}`)
})
```

- [ ] **Step 11: Tests, lint y build**

Run: `npm test`
Expected: PASS (todos, incluidos los cinco archivos nuevos).

Run: `npm run lint`
Expected: sin errores.

Run: `npm run build`
Expected: termina con líneas `Prerender (html): / -> build/client/index.html`, `Prerender (html): /404 -> build/client/404/index.html`, `Prerender (html): SPA Fallback -> build/client/__spa-fallback.html` y `Removing the server build ... due to ssr:false`. Si falla con `window is not defined` / `document is not defined`, el culpable es código que toca el navegador al importar o al renderizar: moverlo a un efecto (o a `import()` dentro del efecto). No se resuelve con `typeof window` en el render (rompería la hidratación).

- [ ] **Step 12: Comprobar prerender, 404 y que three.js no está en el chunk inicial**

```bash
ls build/client/index.html build/client/404.html build/client/__spa-fallback.html
grep -c 'id="hero"' build/client/index.html
grep -c '<title>Miguel Ángel Domínguez · Webs, herramientas y apps a medida</title>' build/client/index.html
for f in $(grep -oE '/assets/[^"]+\.js' build/client/index.html | sort -u); do printf '%s %s\n' "$f" "$(grep -c __THREE_DEVTOOLS__ "build/client$f")"; done
grep -l __THREE_DEVTOOLS__ build/client/assets/*.js
```

Expected: los tres archivos existen; `1`; `1`; **todas** las líneas del bucle terminan en ` 0`; el último comando lista un único chunk (el de `SceneCanvas`), que no aparece en el bucle.

Vista previa tipo Vercel (en segundo plano; pararla al acabar):

```bash
npm run preview &
sleep 1
curl -s -o /dev/null -w '%{http_code}\n' 'http://localhost:4173/?scene=static'
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:4173/no-existe
curl -s http://localhost:4173/no-existe | grep -c 'Esta página no existe'
kill %1
```

Expected: `200`, `404`, `1`.

Comprobación visual rápida: `npm run dev`, abrir `http://localhost:5173/` y `http://localhost:5173/?scene=static`: la home de la fase 1 se ve igual que antes (preloader, escena, secciones); `http://localhost:5173/no-existe` muestra la 404.

- [ ] **Step 13: Commit**

```bash
git add package.json package-lock.json vite.config.js react-router.config.js vercel.json eslint.config.js .gitignore scripts/serve-build.js src/root.jsx src/routes.js src/routes/home.jsx src/routes/not-found.jsx src/routes/home.test.jsx src/routes/not-found.test.jsx src/styles/pages.css src/data/site.js src/data/site.test.js src/data/seo.js src/lib/siteUrl.js src/lib/seo.js src/lib/seo.test.js src/test/router.jsx src/scene/useQualityTier.js src/scene/useQualityTier.test.js src/i18n/strings.js
git commit -m "Migrate to React Router 7 framework mode with prerendered routes

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

(`git rm` del Paso 9 ya dejó los borrados preparados.)

---
### Task 2: Contenido v2 en datos bilingües

> **Tipo:** transcripción pura (todo el código y el copy están aquí). Modelo económico.

**Files:**
- Modify: `src/data/profile.js`, `src/data/experience.js`, `src/data/skills.js`, `src/data/site.js`
- Create: `src/data/services.js`, `src/data/process.js`, `src/data/now.js`, `src/data/cases/solarmetrics.js`, `src/data/cases/seenat.js`, `src/data/cases/index.js`
- Test: `src/data/content.test.js`

**Interfaces:**
- Consumes: `localize` (`src/data/localize.js`), `TECH` (`src/data/skills.js`).
- Produces:
  - `profile.hero` `{ questions: Localized[3], answer, intro, proof }` y `profile.about` `{ hook, text, education }` (cada campo `{ es, en }`).
  - `services: Array<{ id: 'web'|'tool'|'app', number: '01'|'02'|'03', pose: 'service-web'|'service-tool'|'service-app', screen: 'site-build'|'dashboard'|'seenat', caseSlug: string|null, title, message, includes }>`.
  - `processSteps: Array<{ id, number: '01'..'04', title, detail }>`.
  - `now: { updated: 'YYYY-MM-DD', items: Array<{ id, label, text }> }`.
  - `JOURNEY_IDS = ['mecaofi', 'grupo-avanza', 'intelec', 'macrosad']`; cada `experience[i]` gana `shortName: string`.
  - `cases: Case[]`, `getCase(slug) → Case | null` desde `src/data/cases/index.js`. `Case = { slug, name, status: 'done'|'in-progress', label, tagline, highlight: Localized|null, stats: Array<{ id, value: string, label }>, stack: string[] (claves de TECH), links: { demo?, code? }, logo?, preview: 'dashboard'|'seenat', challenge, built: { es: string[], en: string[] }, flow?: { title, steps: Array<{ title, text }> }, decisions: Array<{ title, why }>, result, next, journal?: Array<{ date: 'YYYY-MM-DD', text }> }`.
  - `CASE_SLUGS = ['solarmetrics', 'seenat']` en `src/data/site.js`.
  - Nuevas entradas en `TECH`: `chartjs`, `flutter`, `dart`, `supabase`, `postgresql`.

- [ ] **Step 1: Escribir el test que falla** — `src/data/content.test.js`:

```js
import { describe, expect, it } from 'vitest'
import { profile } from './profile'
import { services } from './services'
import { processSteps } from './process'
import { now } from './now'
import { experience, JOURNEY_IDS } from './experience'
import { cases, getCase } from './cases'
import { CASE_SLUGS } from './site'
import { TECH } from './skills'

const filled = (value) => typeof value === 'string' && value.trim().length > 0
const isLocalized = (value) =>
  Boolean(value) &&
  typeof value === 'object' &&
  (Array.isArray(value.es)
    ? Array.isArray(value.en) && value.es.length === value.en.length && value.es.every(filled) && value.en.every(filled)
    : filled(value.es) && filled(value.en))

describe('hero and about copy', () => {
  it('asks three questions and answers them, in both languages', () => {
    expect(profile.hero.questions).toHaveLength(3)
    for (const question of profile.hero.questions) expect(isLocalized(question)).toBe(true)
    for (const key of ['answer', 'intro', 'proof']) expect(isLocalized(profile.hero[key]), key).toBe(true)
    expect(profile.hero.questions[0].es).toBe('¿Necesitas una web que te traiga clientes?')
    expect(profile.hero.answer.es).toBe('Te la construyo. A medida.')
    expect(profile.hero.proof.es).toBe('Web Developer en Macrosad · Creador de Seenat y SolarMetrics')
  })

  it('tells the story in both languages', () => {
    for (const key of ['hook', 'text', 'education']) expect(isLocalized(profile.about[key]), key).toBe(true)
    expect(profile.about.education.es).toBe('Doble titulación ASIR + DAM · nota media 9,7')
  })
})

describe('services', () => {
  it('offers web, tool and app in order, each with its proof', () => {
    expect(services.map((service) => service.id)).toEqual(['web', 'tool', 'app'])
    expect(services.map((service) => service.number)).toEqual(['01', '02', '03'])
    for (const service of services) {
      for (const key of ['title', 'message', 'includes']) expect(isLocalized(service[key]), `${service.id}.${key}`).toBe(true)
      if (service.caseSlug !== null) expect(CASE_SLUGS).toContain(service.caseSlug)
    }
    // The hair-salon demo arrives in phase E; until then the web service has no proof link.
    expect(services[0].caseSlug).toBeNull()
  })
})

describe('process', () => {
  it('has four numbered steps', () => {
    expect(processSteps.map((step) => step.number)).toEqual(['01', '02', '03', '04'])
    for (const step of processSteps) {
      expect(isLocalized(step.title), step.id).toBe(true)
      expect(isLocalized(step.detail), step.id).toBe(true)
    }
  })
})

describe('right now', () => {
  it('was updated less than 120 days ago (update src/data/now.js if this fails)', () => {
    expect(now.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    const ageInDays = (Date.now() - Date.parse(`${now.updated}T00:00:00Z`)) / 86_400_000
    expect(ageInDays).toBeGreaterThanOrEqual(0)
    expect(ageInDays).toBeLessThan(120)
  })

  it('lists what I am building, learning and enjoying', () => {
    expect(now.items.map((item) => item.id)).toEqual(['building', 'learning', 'enjoying'])
    for (const item of now.items) expect(isLocalized(item.label) && isLocalized(item.text), item.id).toBe(true)
  })
})

describe('journey', () => {
  it('walks through four real jobs, from first to current', () => {
    expect(JOURNEY_IDS).toEqual(['mecaofi', 'grupo-avanza', 'intelec', 'macrosad'])
    for (const id of JOURNEY_IDS) {
      const job = experience.find((item) => item.id === id)
      expect(job, id).toBeDefined()
      expect(filled(job.shortName), id).toBe(true)
    }
  })
})

describe('cases', () => {
  it('matches the published slugs', () => {
    expect(cases.map((item) => item.slug)).toEqual(CASE_SLUGS)
    expect(getCase('seenat').name).toBe('Seenat')
    expect(getCase('nope')).toBeNull()
  })

  it('has every text in both languages and an honest label', () => {
    for (const item of cases) {
      for (const key of ['label', 'tagline', 'challenge', 'built', 'result', 'next']) {
        expect(isLocalized(item[key]), `${item.slug}.${key}`).toBe(true)
      }
      expect(['done', 'in-progress']).toContain(item.status)
      expect(item.decisions.length, item.slug).toBeGreaterThanOrEqual(3)
      expect(item.decisions.length, item.slug).toBeLessThanOrEqual(5)
      for (const decision of item.decisions) expect(isLocalized(decision.title) && isLocalized(decision.why)).toBe(true)
      for (const id of item.stack) expect(TECH[id], `${item.slug}: ${id}`).toBeDefined()
    }
    expect(getCase('solarmetrics').label.es).toContain('Proyecto de fin de grado')
    expect(getCase('seenat').label.es).toContain('En desarrollo')
    expect(getCase('seenat').status).toBe('in-progress')
  })

  it('only shows real figures: a highlight sentence or numeric stats, never both empty', () => {
    for (const item of cases) {
      expect(item.highlight !== null || item.stats.length > 0, item.slug).toBe(true)
      if (item.highlight) expect(isLocalized(item.highlight)).toBe(true)
      for (const stat of item.stats) {
        expect(stat.value).toMatch(/^\d+$/)
        expect(isLocalized(stat.label)).toBe(true)
      }
    }
    expect(getCase('solarmetrics').stats).toEqual([])
  })

  it('keeps the development journal dated and newest first', () => {
    const journal = getCase('seenat').journal
    expect(journal.length).toBeGreaterThan(0)
    for (const entry of journal) {
      expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(isLocalized(entry.text)).toBe(true)
    }
    const dates = journal.map((entry) => entry.date)
    expect([...dates].sort().reverse()).toEqual(dates)
  })

  it('describes the privacy flow step by step', () => {
    const { flow } = getCase('seenat')
    expect(isLocalized(flow.title)).toBe(true)
    expect(flow.steps).toHaveLength(3)
    for (const step of flow.steps) expect(isLocalized(step.title) && isLocalized(step.text)).toBe(true)
  })
})
```

- [ ] **Step 2: Ejecutar el test y verlo fallar**

Run: `npx vitest run src/data/content.test.js`
Expected: FAIL — `Failed to resolve import "./services"`.

- [ ] **Step 3: Perfil** — en `src/data/profile.js`, añadir dentro del objeto `profile`, después de `stats`:

```js
  hero: {
    questions: [
      { es: '¿Necesitas una web que te traiga clientes?', en: 'Need a website that brings you customers?' },
      { es: '¿Una herramienta que sustituya tus Excel?', en: 'A tool that replaces your spreadsheets?' },
      { es: '¿Una app que tus usuarios lleven en el bolsillo?', en: 'An app your users carry in their pocket?' },
    ],
    answer: { es: 'Te la construyo. A medida.', en: "I'll build it for you. Made to measure." },
    intro: {
      es: 'Soy Miguel Ángel, desarrollador web. Te ofrezco mis servicios para crear lo que tu proyecto necesite: una web, una herramienta personalizada o una app móvil, de la idea al lanzamiento.',
      en: "I'm Miguel Ángel, a web developer. I offer my services to build whatever your project needs: a website, a custom tool or a mobile app, from idea to launch.",
    },
    proof: {
      es: 'Web Developer en Macrosad · Creador de Seenat y SolarMetrics',
      en: 'Web Developer at Macrosad · Creator of Seenat and SolarMetrics',
    },
  },
  about: {
    hook: {
      es: 'Empecé arreglando ordenadores. Ahora construyo el software que funciona en ellos.',
      en: 'I started out fixing computers. Now I build the software that runs on them.',
    },
    text: {
      es: 'Pasé por soporte técnico, después por ERP con Odoo y hoy desarrollo herramientas web en Macrosad. Por eso entiendo tanto la tecnología como a la persona que la usa cada día. Me desenvuelvo bien cuando aparecen problemas: es la parte que más disfruto. Soy de Jaén y trabajo con quien sea, esté donde esté.',
      en: "I worked in technical support, then on ERP systems with Odoo, and today I build web tools at Macrosad. That's why I understand both the technology and the person who uses it every day. I do well when problems show up: it's the part I enjoy the most. I'm from Jaén and I work with anyone, wherever they are.",
    },
    education: {
      es: 'Doble titulación ASIR + DAM · nota media 9,7',
      en: 'Two higher technical degrees: systems administration (ASIR) and app development (DAM) · 9.7 average',
    },
  },
```

- [ ] **Step 4: Trayectoria** — en `src/data/experience.js`:
  - Añadir `shortName` a cada puesto, justo después de `company`: `macrosad` → `shortName: 'Macrosad',`; `grupo-avanza` → `shortName: 'Grupo Avanza',`; `intelec` → `shortName: 'Intelec',`; `mecaofi` → `shortName: 'Mecaofi',`.
  - Añadir al final del archivo:

```js
// Order of the "Quién soy" journey (spec §4.5): support → ERP → current job.
export const JOURNEY_IDS = ['mecaofi', 'grupo-avanza', 'intelec', 'macrosad']
```

- [ ] **Step 5: Tecnologías nuevas** — en `src/data/skills.js`:
  - Ampliar la importación de `react-icons/si` con `SiChartdotjs, SiDart, SiFlutter, SiPostgresql, SiSupabase` (mantener el orden alfabético del bloque).
  - Añadir al final del objeto `TECH`:

```js
  chartjs: { name: 'Chart.js', Icon: SiChartdotjs, color: '#ff6384' },
  flutter: { name: 'Flutter', Icon: SiFlutter, color: '#47c5fb' },
  dart: { name: 'Dart', Icon: SiDart, color: '#2cb7f6' },
  supabase: { name: 'Supabase', Icon: SiSupabase, color: '#3ecf8e' },
  postgresql: { name: 'PostgreSQL', Icon: SiPostgresql, color: '#6b8cff' },
```

- [ ] **Step 6: Servicios, proceso y "ahora mismo"**

`src/data/services.js`:

```js
export const services = [
  {
    id: 'web',
    number: '01',
    pose: 'service-web',
    screen: 'site-build',
    caseSlug: null,
    title: { es: 'Tu web', en: 'Your website' },
    message: {
      es: 'Una web que se entiende en 5 segundos y que te encuentran en Google.',
      en: 'A website that makes sense in 5 seconds and that people find on Google.',
    },
    includes: {
      es: 'Diseño a medida, móvil primero, velocidad, SEO, aviso legal y cookies. El dominio y el código son tuyos.',
      en: 'Custom design, mobile first, speed, SEO, legal notice and cookies. The domain and the code are yours.',
    },
  },
  {
    id: 'tool',
    number: '02',
    pose: 'service-tool',
    screen: 'dashboard',
    caseSlug: 'solarmetrics',
    title: { es: 'Tu herramienta', en: 'Your tool' },
    message: {
      es: 'Si lo haces a mano cada semana, se puede automatizar.',
      en: 'If you do it by hand every week, it can be automated.',
    },
    includes: {
      es: 'Paneles, áreas de cliente, gestión interna, informes, conexiones entre sistemas.',
      en: 'Dashboards, client areas, internal management, reports, connections between systems.',
    },
  },
  {
    id: 'app',
    number: '03',
    pose: 'service-app',
    screen: 'seenat',
    caseSlug: 'seenat',
    title: { es: 'Tu app', en: 'Your app' },
    message: {
      es: 'Tu idea, en el bolsillo de tus usuarios. iOS y Android a la vez.',
      en: "Your idea, in your users' pockets. iOS and Android at once.",
    },
    includes: {
      es: 'App Flutter, backend, login, notificaciones, privacidad desde el diseño.',
      en: 'Flutter app, backend, login, notifications, privacy by design.',
    },
  },
]
```

`src/data/process.js`:

```js
export const processSteps = [
  {
    id: 'idea',
    number: '01',
    title: { es: 'Me cuentas tu idea', en: 'You tell me your idea' },
    detail: {
      es: 'Aunque no sepas cómo se llama lo que necesitas. Rellenas el mini-brief y te respondo en menos de 48 h.',
      en: "Even if you don't know what it's called. You fill in the short brief and I reply within 48 hours.",
    },
  },
  {
    id: 'proposal',
    number: '02',
    title: { es: 'Propuesta por escrito', en: 'A written proposal' },
    detail: {
      es: 'Alcance, plazos y precio cerrado antes de empezar. Sin letra pequeña.',
      en: 'Scope, timeline and a fixed price before we start. No small print.',
    },
  },
  {
    id: 'build',
    number: '03',
    title: { es: 'Lo construimos juntos', en: 'We build it together' },
    detail: {
      es: 'Entregas por fases y un enlace donde ves el avance cada semana.',
      en: 'Delivery in phases and a link where you can see the progress every week.',
    },
  },
  {
    id: 'launch',
    number: '04',
    title: { es: 'Lanzamiento y después', en: 'Launch and beyond' },
    detail: {
      es: 'El código, el dominio y las cuentas son tuyos. 30 días de soporte incluidos tras el lanzamiento.',
      en: 'The code, the domain and the accounts are yours. 30 days of support included after launch.',
    },
  },
]
```

`src/data/now.js`:

```js
// Update every few months: a data test fails once `updated` is 120 days old.
export const now = {
  updated: '2026-10-01',
  items: [
    {
      id: 'building',
      label: { es: 'Construyendo:', en: 'Building:' },
      text: {
        es: 'herramientas internas en mi trabajo y Seenat, mi app en Flutter.',
        en: 'internal tools at work and Seenat, my Flutter app.',
      },
    },
    {
      id: 'learning',
      label: { es: 'Aprendiendo:', en: 'Learning:' },
      text: { es: 'a diseñar interfaces con más oficio.', en: 'to design interfaces with more craft.' },
    },
    {
      id: 'enjoying',
      label: { es: 'Me gusta:', en: 'I enjoy:' },
      text: {
        es: 'los problemas difíciles; ahí es donde más aprendo.',
        en: "hard problems; that's where I learn the most.",
      },
    },
  ],
}
```

- [ ] **Step 7: Casos** — los hechos están comprobados (solo lectura) en `C:/Users/Mikel/Documents/React/SolarMetrics/src` (roles ADMIN/USER, usuarios con `deviceIds`, Chart.js en `package.json`) y en `C:/Users/Mikel/Documents/Proyectos/seenat` (`CLAUDE.md`, `docs/superpowers/specs/2026-09-27-seenat-v1-design.md`, `supabase/tests/database/*.sql`). No añadir cifras ni hechos que no estén aquí.

`src/data/cases/solarmetrics.js`:

```js
export const solarmetrics = {
  slug: 'solarmetrics',
  name: 'SolarMetrics',
  status: 'done',
  label: {
    es: 'Herramienta a medida · Proyecto de fin de grado',
    en: 'Custom tool · Final degree project',
  },
  tagline: {
    es: 'De series de números en una base de datos a un panel que se entiende de un vistazo.',
    en: 'From rows of numbers in a database to a dashboard you understand at a glance.',
  },
  highlight: {
    es: 'API propia que simula una instalación fotovoltaica en tiempo real',
    en: 'Custom API that simulates a photovoltaic plant in real time',
  },
  stats: [],
  stack: ['react', 'javascript', 'chartjs', 'springboot', 'java', 'python', 'influxdb'],
  links: { demo: 'https://solarmetrics.vercel.app', code: 'https://github.com/mdomgar/SolarMetrics' },
  logo: { src: '/img/solarmetrics-logo.webp', width: 256, height: 256 },
  preview: 'dashboard',
  challenge: {
    es: 'Los datos de una instalación fotovoltaica solo existían como series de números en una base de datos: difíciles de leer e imposibles de enseñar a alguien que no sea técnico.',
    en: 'The data from a photovoltaic plant only existed as series of numbers in a database: hard to read and impossible to show to anyone non-technical.',
  },
  built: {
    es: [
      'Una API propia que genera mediciones simuladas de una instalación fotovoltaica y las guarda en InfluxDB.',
      'Un panel en React que consume esa API: potencia, energía y curvas de producción por inversor.',
      'Inicio de sesión con roles (administrador y usuario), gestión de usuarios y gestión de dispositivos.',
    ],
    en: [
      'A custom API that generates simulated measurements from a photovoltaic plant and stores them in InfluxDB.',
      'A React dashboard that consumes that API: power, energy and production curves per inverter.',
      'Login with roles (administrator and user), user management and device management.',
    ],
  },
  decisions: [
    {
      title: { es: 'InfluxDB para las mediciones', en: 'InfluxDB for the measurements' },
      why: {
        es: 'Es una base de datos pensada para series temporales: guardar y consultar lecturas por fecha es su trabajo, no un apaño.',
        en: 'It is a database built for time series: storing and querying readings by date is its job, not a workaround.',
      },
    },
    {
      title: { es: 'Una API que simula la instalación', en: 'An API that simulates the plant' },
      why: {
        es: 'Sin hardware real disponible, simular las lecturas permitió desarrollar y probar el panel como si estuviera conectado a una planta de verdad.',
        en: 'With no real hardware available, simulating the readings made it possible to build and test the dashboard as if it were connected to a real plant.',
      },
    },
    {
      title: { es: 'Usuarios, roles y dispositivos', en: 'Users, roles and devices' },
      why: {
        es: 'Cada usuario ve solo los dispositivos que tiene asignados, y el administrador decide quién ve qué.',
        en: 'Each user only sees the devices assigned to them, and the administrator decides who sees what.',
      },
    },
  ],
  result: {
    es: 'Proyecto de fin de grado del ciclo de DAM, entregado, con una demo pública que funciona con datos simulados.',
    en: 'Final project of my multiplatform development degree, delivered, with a public demo running on simulated data.',
  },
  next: {
    es: 'Conectarlo a una instalación real en lugar de la API simulada y avisar cuando un inversor rinda por debajo de lo esperado.',
    en: 'Connect it to a real plant instead of the simulated API and send an alert when an inverter underperforms.',
  },
}
```

`src/data/cases/seenat.js`:

```js
// Facts verified read-only against C:/Users/Mikel/Documents/Proyectos/seenat on 2026-10-01.
// 163 = sum of plan(n) across supabase/tests/database/*.sql (CLAUDE.md still says 158 from before
// migration 20260930000100). Miguel confirms with `npx supabase test db` before publishing.
export const seenat = {
  slug: 'seenat',
  name: 'Seenat',
  status: 'in-progress',
  label: { es: 'App móvil · En desarrollo', en: 'Mobile app · In development' },
  tagline: {
    es: 'Conecta con quien coincidiste esa noche, sin revelar nunca dónde estuviste.',
    en: 'Connect with the people you crossed paths with that night, without ever revealing where you were.',
  },
  highlight: null,
  stats: [
    { id: 'tests', value: '163', label: { es: 'pruebas automáticas en el backend', en: 'automated backend tests' } },
    { id: 'coordinates', value: '0', label: { es: 'coordenadas guardadas', en: 'coordinates stored' } },
  ],
  stack: ['flutter', 'dart', 'supabase', 'postgresql'],
  links: {},
  preview: 'seenat',
  challenge: {
    es: 'Coincides con alguien en una fiesta o un evento y te gustaría seguirle en Instagram, pero no te atreves a pedírselo o ya se ha ido. El reto es conectar a esas personas sin exponer nunca dónde está nadie.',
    en: "You cross paths with someone at a party or an event and you'd like to follow them on Instagram, but you don't dare ask or they've already left. The challenge is connecting those people without ever exposing where anyone is.",
  },
  built: {
    es: [
      'Una app en Flutter con backend en Supabase (región UE).',
      'Presencia por evento o por "burbuja": una celda fija de unos 200 m a la que te unes cuando no hay evento.',
      'Verificación de edad con selfie e Instagram verificado con un código temporal en la bio.',
      'Eventos con un QR que sirve como prueba de que estás allí.',
    ],
    en: [
      'A Flutter app with a Supabase backend (EU region).',
      'Presence per event or per "bubble": a fixed cell of about 200 m you join when there is no event.',
      'Age verification with a selfie, and Instagram verified with a temporary code in the bio.',
      'Events with a QR code that proves you are there.',
    ],
  },
  flow: {
    title: { es: 'Qué pasa con tu ubicación', en: 'What happens to your location' },
    steps: [
      {
        title: { es: 'Tu móvil', en: 'Your phone' },
        text: {
          es: 'Envía tu ubicación solo para saber a qué evento o burbuja perteneces.',
          en: 'Sends your location only to work out which event or bubble you belong to.',
        },
      },
      {
        title: { es: 'El servidor', en: 'The server' },
        text: {
          es: 'Decide el evento o la celda de unos 200 m y no guarda las coordenadas.',
          en: 'Picks the event or the ~200 m cell and does not store the coordinates.',
        },
      },
      {
        title: { es: 'Lo que ven los demás', en: 'What others see' },
        text: {
          es: 'Que coincidisteis en el mismo sitio. Nunca dónde, a qué distancia ni a qué hora exacta.',
          en: 'That you were at the same place. Never where, how far away or at what exact time.',
        },
      },
    ],
  },
  decisions: [
    {
      title: { es: 'No se guardan coordenadas', en: 'No coordinates are stored' },
      why: {
        es: 'La ubicación solo viaja del móvil al servidor para decidir a qué evento o burbuja perteneces; ninguna respuesta incluye coordenadas, distancias ni horas exactas de nadie.',
        en: "Location only travels from the phone to the server to decide which event or bubble you belong to; no response ever includes anyone's coordinates, distances or exact times.",
      },
    },
    {
      title: { es: 'Acceso solo por funciones RPC con RLS', en: 'Access only through RPC functions with RLS' },
      why: {
        es: 'Las tablas no se exponen: la app solo puede llamar a funciones concretas, y la seguridad a nivel de fila protege cada dato.',
        en: 'Tables are never exposed: the app can only call specific functions, and row-level security protects every record.',
      },
    },
    {
      title: { es: 'Nombres de lugar ocultos con menos de 5 personas', en: 'Place names hidden below 5 people' },
      why: {
        es: 'En una burbuja con poca gente, el nombre del sitio permitiría adivinar dónde está alguien; por debajo de 5 personas se muestra un genérico "cerca de ti".',
        en: 'In a bubble with few people, the place name would give away where someone is; below 5 people the app shows a generic "near you".',
      },
    },
    {
      title: { es: 'Límites de solicitudes', en: 'Request limits' },
      why: {
        es: 'Como máximo 50 solicitudes al día y 20 por evento, para que nadie use la app para insistir.',
        en: 'At most 50 requests a day and 20 per event, so nobody can use the app to pester people.',
      },
    },
  ],
  result: {
    es: 'El backend está terminado y cubierto con pruebas pgTAP de privacidad, presencia y conexiones. La app en Flutter tiene sus pantallas principales; ahora toca conectar la verificación de identidad y las notificaciones.',
    en: 'The backend is finished and covered by pgTAP tests for privacy, presence and connections. The Flutter app has its main screens; next comes wiring up identity verification and notifications.',
  },
  next: {
    es: 'Una beta cerrada en uno o dos locales antes de abrirla a más gente.',
    en: 'A closed beta in one or two venues before opening it up to more people.',
  },
  journal: [
    {
      date: '2026-09-30',
      text: {
        es: 'La página web de cada evento, a la que se llega desde el QR o un enlace, ya muestra el botón "Asistiré" correcto a quien la abre.',
        en: 'Each event web page, reached from the QR code or a link, now shows the right "I\'m going" button to whoever opens it.',
      },
    },
    {
      date: '2026-09-28',
      text: {
        es: 'Revisión del plan de la app: solo pueden usarla personas verificadas, y seguir tu presencia en segundo plano pide su propio consentimiento.',
        en: 'App plan review: only verified people can use it, and keeping your presence in the background asks for its own consent.',
      },
    },
    {
      date: '2026-09-27',
      text: {
        es: 'Diseño de la versión 1 y plan del backend. La privacidad es el producto: no se guardan coordenadas, selfies ni historial de ubicaciones.',
        en: 'Version 1 design and backend plan. Privacy is the product: no coordinates, selfies or location history are stored.',
      },
    },
  ],
}
```

`src/data/cases/index.js`:

```js
import { solarmetrics } from './solarmetrics.js'
import { seenat } from './seenat.js'

export const cases = [solarmetrics, seenat]

export function getCase(slug) {
  return cases.find((item) => item.slug === slug) ?? null
}
```

`src/data/site.js`: añadir debajo de `NOT_FOUND_PATH`:

```js
export const CASE_SLUGS = ['solarmetrics', 'seenat']
```

- [ ] **Step 8: Ejecutar los tests**

Run: `npx vitest run src/data`
Expected: PASS (incluido el `data.test.js` existente, que sigue comprobando `TECH` y los textos antiguos).

- [ ] **Step 9: Lint, build y commit**

Run: `npm test && npm run lint && npm run build`
Expected: todo en verde.

```bash
git add src/data/profile.js src/data/experience.js src/data/skills.js src/data/site.js src/data/services.js src/data/process.js src/data/now.js src/data/cases/solarmetrics.js src/data/cases/seenat.js src/data/cases/index.js src/data/content.test.js
git commit -m "Add bilingual content for services, process, cases and about

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Pantallas `site-build` y `seenat`, registro de pantallas y `ScreenPreview`

> **Tipo:** transcripción pura (funciones de dibujo sin three, testeadas con el contexto falso existente). Modelo económico.

**Files:**
- Create: `src/scene/screens/siteBuild.js`, `src/scene/screens/seenat.js`, `src/scene/screens/index.js`
- Create: `src/components/ScreenPreview.jsx`, `src/components/css/ScreenPreview.css`, `src/components/ScreenPreview.test.jsx`
- Modify: `src/scene/screens/screens.test.js`, `src/components/Projects.jsx`, `src/components/css/Projects.css`, `src/i18n/strings.js`
- Delete: `src/components/DashboardPreview.jsx`

**Interfaces:**
- Consumes: `drawCode`, `drawDashboard`, `DASHBOARD_LABELS` (existentes), `useLang`, `useT`.
- Produces:
  - `drawSiteBuild(ctx, time, width, height, complete = false, labels = SITE_BUILD_LABELS.es)`, `SITE_BUILD_LABELS { es, en }`, `BUILD_STEPS: string[]` (6), `stepFraction(progress, index) → 0..1`, `typedText(text, fraction) → string`.
  - `drawSeenat(ctx, time, width, height, complete = false, labels = SEENAT_LABELS.es)`, `SEENAT_LABELS { es, en }`, `pulseAt(time, complete) → 0..1`.
  - `SCREENS: Record<'code'|'dashboard'|'site-build'|'seenat', { width, height, altKey?, draw(ctx, time, width, height, complete, lang) }>` en `src/scene/screens/index.js` (sin three).
  - `<ScreenPreview screen reducedMotion className? />`: `<canvas role="img">` con el alt de `strings[SCREENS[screen].altKey]`, fotograma fijo con reduced motion y animación solo mientras es visible.
  - Strings `siteBuildAlt`, `seenatAlt`.

- [ ] **Step 1: Escribir los tests que fallan**

En `src/scene/screens/screens.test.js`:
  - Añadir a los imports:

```js
import { BUILD_STEPS, drawSiteBuild, SITE_BUILD_LABELS, stepFraction, typedText } from './siteBuild'
import { drawSeenat, pulseAt, SEENAT_LABELS } from './seenat'
import { SCREENS } from './index'
import { strings } from '../../i18n/strings'
```

  - En `describe('reduced motion (complete = true)')` cambiar la lista por `const screens = { drawCode, drawTerminal, drawDashboard, drawSiteBuild, drawSeenat }`.
  - Añadir al final del archivo:

```js
describe('site-build screen', () => {
  it('types text progressively and never overflows', () => {
    expect(typedText('Hola', 0)).toBe('')
    expect(typedText('Hola', 0.5)).toBe('Ho')
    expect(typedText('Hola', 1)).toBe('Hola')
    expect(typedText('Hola', 3)).toBe('Hola')
  })

  it('reveals the blocks one after another and completes at the end', () => {
    for (let index = 0; index < BUILD_STEPS.length; index += 1) {
      expect(stepFraction(0, index)).toBe(0)
      expect(stepFraction(1, index)).toBe(1)
    }
    expect(stepFraction(0.3, 0)).toBeGreaterThan(stepFraction(0.3, 3))
    for (let p = 0; p < 1; p += 0.1) expect(stepFraction(p + 0.1, 2)).toBeGreaterThanOrEqual(stepFraction(p, 2))
  })

  it('draws the whole page, headline included, on the static frame', () => {
    const { ctx, calls } = createRecordingContext()
    drawSiteBuild(ctx, 0, 1024, 368, true)
    expect(calls).toContainEqual(['fillText', SITE_BUILD_LABELS.es.headline, expect.any(Number), expect.any(Number)])
  })
})

describe('seenat screen', () => {
  it('pulses between 0 and 1 and freezes when complete', () => {
    for (const t of [0, 0.4, 1.3, 7.9]) {
      expect(pulseAt(t, false)).toBeGreaterThanOrEqual(0)
      expect(pulseAt(t, false)).toBeLessThan(1)
    }
    expect(pulseAt(3.3, true)).toBe(pulseAt(0, true))
  })

  it('shows the bubble and the Instagram button', () => {
    const { ctx, calls } = createRecordingContext()
    drawSeenat(ctx, 0, 360, 720, true)
    const texts = calls.filter((call) => call[0] === 'fillText').map((call) => call[1])
    expect(texts).toContain(SEENAT_LABELS.es.bubble)
    expect(texts).toContain(SEENAT_LABELS.es.request)
  })
})

describe('screen registry', () => {
  it('describes every screen with a size and a draw function', () => {
    expect(Object.keys(SCREENS)).toEqual(['code', 'dashboard', 'site-build', 'seenat'])
    for (const screen of Object.values(SCREENS)) {
      expect(screen.width).toBeGreaterThan(0)
      expect(screen.height).toBeGreaterThan(0)
      expect(typeof screen.draw).toBe('function')
    }
  })

  it('has alt text in both languages for every previewable screen', () => {
    for (const id of ['dashboard', 'site-build', 'seenat']) {
      const text = strings[SCREENS[id].altKey]
      expect(text?.es, id).toBeTruthy()
      expect(text?.en, id).toBeTruthy()
    }
  })

  it('keeps the same label keys in every language', () => {
    expect(Object.keys(SITE_BUILD_LABELS.es)).toEqual(Object.keys(SITE_BUILD_LABELS.en))
    expect(Object.keys(SEENAT_LABELS.es)).toEqual(Object.keys(SEENAT_LABELS.en))
  })
})
```

`src/components/ScreenPreview.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ScreenPreview from './ScreenPreview'
import { SITE_BUILD_LABELS } from '../scene/screens/siteBuild'

function fakeContext() {
  const base = { measureText: (text) => ({ width: text.length * 10 }), createLinearGradient: () => ({ addColorStop() {} }) }
  return new Proxy(base, {
    get(target, key) {
      if (!(key in target)) target[key] = vi.fn()
      return target[key]
    },
  })
}

afterEach(() => vi.restoreAllMocks())

describe('ScreenPreview', () => {
  it('renders an accessible canvas sized for the screen', () => {
    render(<ScreenPreview screen="seenat" reducedMotion />)
    const canvas = screen.getByRole('img', { name: /Interfaz de Seenat/ })
    expect(canvas).toHaveAttribute('width', '360')
    expect(canvas).toHaveAttribute('height', '720')
  })

  it('draws the finished frame straight away when motion is reduced', () => {
    const ctx = fakeContext()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx)
    render(<ScreenPreview screen="site-build" reducedMotion />)
    expect(ctx.fillText).toHaveBeenCalledWith(SITE_BUILD_LABELS.es.headline, expect.any(Number), expect.any(Number))
  })
})
```

- [ ] **Step 2: Ejecutar y verlos fallar**

Run: `npx vitest run src/scene/screens src/components/ScreenPreview.test.jsx`
Expected: FAIL — `Failed to resolve import "./siteBuild"` y `"./ScreenPreview"`.

- [ ] **Step 3: Pantalla `site-build`** — `src/scene/screens/siteBuild.js` (solo usa métodos del contexto falso de los tests: `fillRect`, `fillText`, `beginPath`, `arc`, `fill`, `roundRect`, `measureText`):

```js
export const SITE_BUILD_LABELS = {
  es: {
    url: 'tu-negocio.es',
    brand: 'Tu negocio',
    nav: ['Servicios', 'Precios', 'Contacto'],
    headline: 'Reserva tu cita en 30 segundos',
    sub: 'Abierto de lunes a sábado',
    cta: 'Reservar',
    cards: ['Corte', 'Color', 'Peinado'],
  },
  en: {
    url: 'your-business.com',
    brand: 'Your business',
    nav: ['Services', 'Prices', 'Contact'],
    headline: 'Book your appointment in 30 seconds',
    sub: 'Open Monday to Saturday',
    cta: 'Book now',
    cards: ['Cut', 'Colour', 'Styling'],
  },
}

export const BUILD_STEPS = ['nav', 'headline', 'cta', 'card-0', 'card-1', 'card-2']

const LOOP_SECONDS = 9
const BUILD_SECONDS = 6
const clamp01 = (value) => Math.min(1, Math.max(0, value))

export function stepFraction(progress, index) {
  return clamp01(progress * (BUILD_STEPS.length + 1) - index)
}

export function typedText(text, fraction) {
  return text.slice(0, Math.round(text.length * clamp01(fraction)))
}

function fillRound(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  ctx.fill()
}

export function drawSiteBuild(ctx, time, width, height, complete = false, labels = SITE_BUILD_LABELS.es) {
  const progress = complete ? 1 : Math.min(1, (time % LOOP_SECONDS) / BUILD_SECONDS)
  const step = (index) => (complete ? 1 : stepFraction(progress, index))
  const left = 32

  ctx.globalAlpha = 1
  ctx.fillStyle = '#0a0d16'
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = '#131722'
  ctx.fillRect(0, 0, width, 34)
  ;['#ff5f57', '#febc2e', '#28c840'].forEach((color, index) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(18 + index * 18, 17, 5, 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.fillStyle = '#0a0d16'
  fillRound(ctx, 84, 8, 300, 18, 9)
  ctx.fillStyle = '#8a93a6'
  ctx.font = '12px "JetBrains Mono", monospace'
  ctx.fillText(labels.url, 98, 21)

  const nav = step(0)
  if (nav > 0) {
    ctx.globalAlpha = nav
    ctx.fillStyle = '#e8ecf4'
    ctx.font = '600 18px Inter, sans-serif'
    ctx.fillText(labels.brand, left, 72)
    ctx.fillStyle = '#8a93a6'
    ctx.font = '14px Inter, sans-serif'
    labels.nav.forEach((item, index) => ctx.fillText(item, width - 320 + index * 100, 72))
    ctx.fillStyle = 'rgba(0,229,255,0.35)'
    ctx.fillRect(left, 88, (width - left * 2) * nav, 1)
  }

  const headline = step(1)
  if (headline > 0) {
    ctx.globalAlpha = 1
    ctx.fillStyle = '#e8ecf4'
    ctx.font = '600 34px Inter, sans-serif'
    const text = typedText(labels.headline, headline)
    ctx.fillText(text, left, 140)
    if (headline < 1) {
      ctx.fillStyle = '#00e5ff'
      ctx.fillRect(left + ctx.measureText(text).width + 4, 114, 3, 32)
    } else {
      ctx.fillStyle = '#8a93a6'
      ctx.font = '16px Inter, sans-serif'
      ctx.fillText(labels.sub, left, 170)
    }
  }

  const cta = step(2)
  if (cta > 0) {
    ctx.globalAlpha = cta
    ctx.fillStyle = '#00e5ff'
    fillRound(ctx, left, 188, 150, 40, 20)
    ctx.fillStyle = '#041016'
    ctx.font = '600 16px Inter, sans-serif'
    ctx.fillText(labels.cta, left + 40, 214)
  }

  const cardWidth = (width - left * 2 - 32) / 3
  labels.cards.forEach((card, index) => {
    const reveal = step(3 + index)
    if (reveal <= 0) return
    const x = left + index * (cardWidth + 16)
    const y = 252 + (1 - reveal) * 12
    ctx.globalAlpha = reveal
    ctx.fillStyle = '#131722'
    fillRound(ctx, x, y, cardWidth, 92, 12)
    ctx.fillStyle = index === 1 ? '#7c5cff' : '#00e5ff'
    ctx.fillRect(x + 16, y + 18, 28, 4)
    ctx.fillStyle = '#e8ecf4'
    ctx.font = '600 18px Inter, sans-serif'
    ctx.fillText(card, x + 16, y + 56)
  })

  ctx.globalAlpha = 1
}
```

- [ ] **Step 4: Pantalla `seenat`** — `src/scene/screens/seenat.js` (interfaz del móvil, todos los datos ficticios):

```js
export const SEENAT_LABELS = {
  es: {
    time: '23:41',
    event: 'Fiesta de fin de verano',
    venue: 'Sala Ejemplo · hasta las 06:00',
    bubble: 'Burbuja · cerca de ti',
    people: 'Coincidisteis esta noche',
    names: ['Alba', 'Dani', 'Lucía', 'Marco'],
    request: 'Solicitar Instagram',
  },
  en: {
    time: '23:41',
    event: 'End of summer party',
    venue: 'Sample Club · until 06:00',
    bubble: 'Bubble · near you',
    people: 'You crossed paths tonight',
    names: ['Alba', 'Dani', 'Lucía', 'Marco'],
    request: 'Request Instagram',
  },
}

const PULSE_SECONDS = 2
const AVATARS = ['#00e5ff', '#7c5cff', '#ffb454', '#3ddc97']

export function pulseAt(time, complete) {
  return complete ? 0.5 : (time % PULSE_SECONDS) / PULSE_SECONDS
}

function fillRound(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  ctx.fill()
}

export function drawSeenat(ctx, time, width, height, complete = false, labels = SEENAT_LABELS.es) {
  const pad = 22
  ctx.globalAlpha = 1
  ctx.fillStyle = '#07080d'
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = '#e8ecf4'
  ctx.font = '600 15px Inter, sans-serif'
  ctx.fillText(labels.time, pad, 34)
  ctx.fillRect(width - pad - 26, 22, 22, 11)

  ctx.fillStyle = '#00e5ff'
  ctx.beginPath()
  ctx.arc(pad + 6, 78, 6, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#e8ecf4'
  ctx.font = '700 26px Inter, sans-serif'
  ctx.fillText('Seenat', pad + 20, 88)

  ctx.fillStyle = '#131722'
  fillRound(ctx, pad, 116, width - pad * 2, 112, 18)
  ctx.fillStyle = '#7c5cff'
  fillRound(ctx, pad + 16, 134, 56, 56, 14)
  ctx.fillStyle = '#e8ecf4'
  ctx.font = '600 17px Inter, sans-serif'
  ctx.fillText(labels.event, pad + 86, 158)
  ctx.fillStyle = '#8a93a6'
  ctx.font = '13px Inter, sans-serif'
  ctx.fillText(labels.venue, pad + 86, 182)

  const pulse = pulseAt(time, complete)
  const cx = pad + 34
  const cy = 280
  ctx.globalAlpha = 1 - pulse
  ctx.strokeStyle = '#3ddc97'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(cx, cy, 14 + pulse * 16, 0, Math.PI * 2)
  ctx.stroke()
  ctx.globalAlpha = 1
  ctx.fillStyle = '#3ddc97'
  ctx.beginPath()
  ctx.arc(cx, cy, 8, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#e8ecf4'
  ctx.font = '600 15px Inter, sans-serif'
  ctx.fillText(labels.bubble, cx + 30, cy + 5)

  ctx.fillStyle = '#8a93a6'
  ctx.font = '13px Inter, sans-serif'
  ctx.fillText(labels.people, pad, 342)

  const tile = (width - pad * 2 - 14) / 2
  labels.names.forEach((name, index) => {
    const x = pad + (index % 2) * (tile + 14)
    const y = 358 + Math.floor(index / 2) * (tile * 0.62 + 14)
    ctx.fillStyle = '#131722'
    fillRound(ctx, x, y, tile, tile * 0.62, 16)
    ctx.fillStyle = AVATARS[index]
    ctx.beginPath()
    ctx.arc(x + 30, y + 32, 16, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#e8ecf4'
    ctx.font = '600 14px Inter, sans-serif'
    ctx.fillText(name, x + 54, y + 37)
    ctx.strokeStyle = index % 2 === 0 ? '#ff6ec7' : '#8a93a6'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(x + tile - 24, y + tile * 0.62 - 22, 7, 0, Math.PI * 2)
    ctx.stroke()
  })

  ctx.fillStyle = '#7c5cff'
  fillRound(ctx, pad, height - 96, width - pad * 2, 52, 26)
  ctx.fillStyle = '#ffffff'
  ctx.font = '600 16px Inter, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(labels.request, width / 2, height - 64)
  ctx.textAlign = 'left'
}
```

- [ ] **Step 5: Registro de pantallas** — `src/scene/screens/index.js`:

```js
import { drawCode } from './code'
import { DASHBOARD_LABELS, drawDashboard } from './dashboard'
import { drawSiteBuild, SITE_BUILD_LABELS } from './siteBuild'
import { drawSeenat, SEENAT_LABELS } from './seenat'

// Three-free: used by the 3D monitors/phone and by the HTML previews (static tier, stacked services, case pages).
export const SCREENS = {
  code: {
    width: 1024,
    height: 368,
    draw: (ctx, time, width, height, complete) => drawCode(ctx, time, width, height, complete),
  },
  dashboard: {
    width: 1024,
    height: 368,
    altKey: 'dashboardAlt',
    draw: (ctx, time, width, height, complete, lang = 'es') =>
      drawDashboard(ctx, time, width, height, complete, DASHBOARD_LABELS[lang] ?? DASHBOARD_LABELS.es),
  },
  'site-build': {
    width: 1024,
    height: 368,
    altKey: 'siteBuildAlt',
    draw: (ctx, time, width, height, complete, lang = 'es') =>
      drawSiteBuild(ctx, time, width, height, complete, SITE_BUILD_LABELS[lang] ?? SITE_BUILD_LABELS.es),
  },
  seenat: {
    width: 360,
    height: 720,
    altKey: 'seenatAlt',
    draw: (ctx, time, width, height, complete, lang = 'es') =>
      drawSeenat(ctx, time, width, height, complete, SEENAT_LABELS[lang] ?? SEENAT_LABELS.es),
  },
}
```

- [ ] **Step 6: Textos alternativos** — añadir a `src/i18n/strings.js` (junto a `dashboardAlt`):

```js
  siteBuildAlt: {
    es: 'Animación de una web que se maqueta sola: cabecera, titular, botón de reserva y tarjetas de servicios',
    en: 'Animation of a website laying itself out: header, headline, booking button and service cards',
  },
  seenatAlt: {
    es: 'Interfaz de Seenat en un móvil: evento, burbuja cercana y botón para pedir el Instagram (datos de ejemplo)',
    en: 'Seenat interface on a phone: event, nearby bubble and a button to request an Instagram (sample data)',
  },
```

- [ ] **Step 7: `ScreenPreview` (sustituye a `DashboardPreview`)**

`src/components/ScreenPreview.jsx`:

```jsx
import { useEffect, useRef } from 'react'
import { SCREENS } from '../scene/screens'
import { useLang, useT } from '../i18n/useLang'
import './css/ScreenPreview.css'

export default function ScreenPreview({ screen, reducedMotion, className = '' }) {
  const lang = useLang()
  const t = useT()
  const ref = useRef(null)
  const { width, height, altKey } = SCREENS[screen]

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined
    const { draw } = SCREENS[screen]
    if (reducedMotion) {
      draw(ctx, 0, canvas.width, canvas.height, true, lang)
      return undefined
    }
    let frame = 0
    let visible = false
    const start = performance.now()
    const loop = (now) => {
      if (!visible) return
      draw(ctx, (now - start) / 1000, canvas.width, canvas.height, false, lang)
      frame = requestAnimationFrame(loop)
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      cancelAnimationFrame(frame)
      if (visible) frame = requestAnimationFrame(loop)
    })
    observer.observe(canvas)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [screen, reducedMotion, lang])

  return (
    <canvas
      ref={ref}
      className={`screen-preview screen-preview--${screen} ${className}`.trim()}
      width={width}
      height={height}
      role="img"
      aria-label={t(altKey)}
    />
  )
}
```

`src/components/css/ScreenPreview.css`:

```css
.screen-preview {
  display: block;
  width: 100%;
  height: auto;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: #0a0d16;
}

.screen-preview--seenat {
  width: min(100%, 260px);
  margin-inline: auto;
  border: 6px solid #0d1017;
  border-radius: 30px;
  box-shadow: 0 0 0 1px var(--border-strong), 0 24px 60px rgba(124, 92, 255, 0.18);
}
```

En `src/components/Projects.jsx`: cambiar `import DashboardPreview from './DashboardPreview'` por `import ScreenPreview from './ScreenPreview'` y `<DashboardPreview reducedMotion={reducedMotion} />` por `<ScreenPreview screen="dashboard" reducedMotion={reducedMotion} />`.

En `src/components/css/Projects.css`, sustituir el bloque que va desde `.dashboard-preview {` hasta el cierre de `@media (max-width: 1023px) { ... }` (líneas 42–68) por:

```css
.project .screen-preview {
  display: none;
}

html[data-scene='static'] .project .screen-preview {
  display: block;
}

@media (prefers-reduced-motion: reduce) {
  .project .screen-preview {
    display: block;
  }
}

@media (max-width: 1023px) {
  .project {
    max-width: none;
  }

  .project .screen-preview {
    display: block;
  }
}
```

```bash
git rm src/components/DashboardPreview.jsx
```

- [ ] **Step 8: Tests, lint, build**

Run: `npm test && npm run lint && npm run build`
Expected: todo en verde (el test de `Projects` sigue encontrando `img` con nombre `/panel de SolarMetrics/`).

- [ ] **Step 9: Commit**

```bash
git add src/scene/screens/siteBuild.js src/scene/screens/seenat.js src/scene/screens/index.js src/scene/screens/screens.test.js src/components/ScreenPreview.jsx src/components/ScreenPreview.test.jsx src/components/css/ScreenPreview.css src/components/Projects.jsx src/components/css/Projects.css src/i18n/strings.js
git commit -m "Add site-build and Seenat screens with a shared screen registry

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---
### Task 4: Escena v2 — `sceneCue`, poses nuevas, móvil y libreta

> **Tipo:** mixto. Código completo (transcripción), pero las coordenadas de las poses y de los props requieren un ajuste visual final (Paso 10). Modelo capaz o revisión visual del controlador.

**Files:**
- Create: `src/scene/poses.js`, `src/scene/poses.test.js`, `src/scene/props/Phone.jsx`, `src/scene/props/Notebook.jsx`
- Modify: `src/data/sections.js`, `src/data/data.test.js`, `src/store/sceneStore.js`, `src/store/sceneStore.test.js`, `src/scene/cameraPoses.js`, `src/scene/cameraPoses.test.js`, `src/scene/CameraRig.jsx`, `src/scene/SceneCanvas.jsx`, `src/scene/SceneLayer.jsx`, `src/scene/SceneLayer.test.jsx`, `src/scene/Monitors.jsx`, `src/scene/layout.js`, `src/scene/props/Props.jsx`, `src/components/Navbar.test.jsx`

**Interfaces:**
- Consumes: `SCREENS` (Tarea 3), `drawTerminal`, `useCanvasTexture`, `services[].pose` (Tarea 2).
- Produces:
  - `SECTIONS` / `SECTION_IDS` = `['hero', 'servicios', 'casos', 'proceso', 'quien-soy', 'ahora', 'brief']` (ids de DOM de la home v2).
  - `src/scene/poses.js` (sin three): `CAMERA_POSES` con exactamente `hero-q1`, `hero-q2`, `hero-q3`, `hero-q4`, `service-web`, `service-tool`, `service-app`, `process`, `about`, `case`, `brief` (`{ position: [x,y,z], target: [x,y,z], parallax?: number }`), `DEFAULT_POSE = 'hero-q4'`, `SECTION_POSES` (incluye la sección de página `'case'`), `DIMMED_POSES = Set(['process', 'case'])`, `resolvePoseId({ section, sceneCue }) → poseId`, `mainScreenFor(poseId) → 'site-build'|'dashboard'|'code'`, `isPhoneLit(poseId) → boolean`.
  - Store: `sceneCue: string|null`, `setSceneCue(cue)`, `releaseSceneCue(cue)` (solo pone `null` si el cue actual es ese), `selectPoseId(state)`.
  - `getPose(id)` en `cameraPoses.js` cae en `hero-q4`.
  - `layout.js`: `PHONE`, `NOTEBOOK`; desaparece `DIMMED_SECTIONS`.

- [ ] **Step 1: Escribir los tests que fallan**

`src/scene/poses.test.js`:

```js
import { describe, expect, it } from 'vitest'
import { SECTION_IDS } from '../data/sections'
import { services } from '../data/services'
import {
  CAMERA_POSES,
  DEFAULT_POSE,
  DIMMED_POSES,
  isPhoneLit,
  mainScreenFor,
  resolvePoseId,
  SECTION_POSES,
} from './poses'

describe('camera poses', () => {
  it('defines exactly the poses in the spec, each with a position and a target', () => {
    expect(Object.keys(CAMERA_POSES).sort()).toEqual(
      ['about', 'brief', 'case', 'hero-q1', 'hero-q2', 'hero-q3', 'hero-q4', 'process', 'service-app', 'service-tool', 'service-web'].sort(),
    )
    for (const [id, pose] of Object.entries(CAMERA_POSES)) {
      expect(pose.position, id).toHaveLength(3)
      expect(pose.target, id).toHaveLength(3)
    }
    expect(CAMERA_POSES[DEFAULT_POSE]).toBeDefined()
  })

  it('maps every home section, the case pages and every service to a pose', () => {
    for (const id of [...SECTION_IDS, 'case']) expect(CAMERA_POSES[SECTION_POSES[id]], id).toBeDefined()
    for (const service of services) expect(CAMERA_POSES[service.pose], service.id).toBeDefined()
  })

  it('dims only the text-heavy poses', () => {
    expect([...DIMMED_POSES].sort()).toEqual(['case', 'process'])
  })
})

describe('resolvePoseId', () => {
  it('follows the visible section', () => {
    expect(resolvePoseId({ section: 'proceso', sceneCue: null })).toBe('process')
    expect(resolvePoseId({ section: 'hero', sceneCue: null })).toBe('hero-q4')
  })

  it('lets a scene cue win over the section', () => {
    expect(resolvePoseId({ section: 'servicios', sceneCue: 'service-app' })).toBe('service-app')
  })

  it('ignores unknown cues and sections', () => {
    expect(resolvePoseId({ section: 'proceso', sceneCue: 'toString' })).toBe('process')
    expect(resolvePoseId({ section: 'nope', sceneCue: null })).toBe(DEFAULT_POSE)
  })
})

describe('screens and phone per pose', () => {
  it('shows a website being built, then the dashboard, then code', () => {
    expect(mainScreenFor('hero-q1')).toBe('site-build')
    expect(mainScreenFor('service-web')).toBe('site-build')
    expect(mainScreenFor('hero-q2')).toBe('dashboard')
    expect(mainScreenFor('service-tool')).toBe('dashboard')
    expect(mainScreenFor('about')).toBe('code')
  })

  it('turns the phone on from the third question onwards', () => {
    expect(isPhoneLit('hero-q1')).toBe(false)
    expect(isPhoneLit('hero-q2')).toBe(false)
    expect(isPhoneLit('hero-q3')).toBe(true)
    expect(isPhoneLit('service-app')).toBe(true)
    expect(isPhoneLit('process')).toBe(true)
  })
})
```

En `src/store/sceneStore.test.js`:
  - Cambiar el import a `import { selectPoseId, useSceneStore } from './sceneStore'`.
  - En el primer test, cambiar la expectativa a `toMatchObject({ section: 'hero', sceneCue: null, tier: null, lampOn: true })`.
  - Añadir al final del `describe`:

```js
  it('lets a scene cue override the section pose', () => {
    useSceneStore.getState().setSection('proceso')
    expect(selectPoseId(useSceneStore.getState())).toBe('process')
    useSceneStore.getState().setSceneCue('service-tool')
    expect(selectPoseId(useSceneStore.getState())).toBe('service-tool')
  })

  it('only releases the cue that is still active', () => {
    const { setSceneCue, releaseSceneCue } = useSceneStore.getState()
    setSceneCue('hero-q2')
    releaseSceneCue('hero-q1')
    expect(useSceneStore.getState().sceneCue).toBe('hero-q2')
    releaseSceneCue('hero-q2')
    expect(useSceneStore.getState().sceneCue).toBeNull()
  })
```

En `src/scene/SceneLayer.test.jsx`, sustituir el test `'dims the scene behind text-heavy sections'` por:

```jsx
  it('dims the scene behind text-heavy sections unless a cue takes over', () => {
    act(() => {
      useSceneStore.getState().setTier('static')
      useSceneStore.getState().setSection('proceso')
    })
    const { container } = render(<SceneLayer reducedMotion={false} />)
    expect(container.firstChild).toHaveAttribute('data-dimmed', 'true')
    act(() => useSceneStore.getState().setSceneCue('service-web'))
    expect(container.firstChild).toHaveAttribute('data-dimmed', 'false')
  })
```

`src/scene/cameraPoses.test.js` (reemplazar entero):

```js
import { describe, expect, it } from 'vitest'
import { Vector3 } from 'three'
import { CAMERA_POSES, dampVec3, getPose } from './cameraPoses'

describe('getPose', () => {
  it('returns the requested pose', () => {
    expect(getPose('brief')).toBe(CAMERA_POSES.brief)
  })

  it('falls back to the open-desk pose for unknown ids', () => {
    expect(getPose('nope')).toBe(CAMERA_POSES['hero-q4'])
  })
})

describe('dampVec3', () => {
  it('moves a vector towards the target without overshooting', () => {
    const v = new Vector3(0, 0, 0)
    dampVec3(v, [10, -10, 4], 2, 1 / 60)
    expect(v.x).toBeGreaterThan(0)
    expect(v.x).toBeLessThan(10)
    expect(v.y).toBeLessThan(0)
    for (let i = 0; i < 600; i += 1) dampVec3(v, [10, -10, 4], 2, 1 / 60)
    expect(v.x).toBeCloseTo(10, 3)
    expect(v.y).toBeCloseTo(-10, 3)
    expect(v.z).toBeCloseTo(4, 3)
  })
})
```

En `src/data/data.test.js`, cambiar el test `'uses unique section ids in page order'` a:

```js
  it('uses unique section ids in page order', () => {
    expect(SECTION_IDS).toEqual(['hero', 'servicios', 'casos', 'proceso', 'quien-soy', 'ahora', 'brief'])
  })
```

En `src/components/Navbar.test.jsx` (la Navbar todavía pinta `SECTIONS` menos el hero; la Tarea 5 la rehace):
  - Expectativa del primer test: `['#servicios', '#casos', '#proceso', '#quien-soy', '#ahora', '#brief']`.
  - En `'opens the mobile menu...'`: `screen.getByRole('link', { name: 'Casos' })`.
  - En `'marks the active section'`: `setSection('casos')`, esperar `aria-current="true"` en `'Casos'` y no en `'Cómo trabajo'`.

- [ ] **Step 2: Ejecutar y verlos fallar**

Run: `npx vitest run src/scene src/store src/data src/components/Navbar.test.jsx`
Expected: FAIL — `Failed to resolve import "./poses"`, `selectPoseId is not a function`, y `SECTION_IDS` con los ids antiguos.

- [ ] **Step 3: Secciones de la home v2** — `src/data/sections.js` (reemplazar entero):

```js
export const SECTIONS = [
  { id: 'hero', label: { es: 'Inicio', en: 'Home' } },
  { id: 'servicios', label: { es: 'Servicios', en: 'Services' } },
  { id: 'casos', label: { es: 'Casos', en: 'Case studies' } },
  { id: 'proceso', label: { es: 'Cómo trabajo', en: 'How I work' } },
  { id: 'quien-soy', label: { es: 'Quién soy', en: 'About me' } },
  { id: 'ahora', label: { es: 'Ahora mismo', en: 'Right now' } },
  { id: 'brief', label: { es: 'Cuéntame tu proyecto', en: 'Tell me about your project' } },
]

export const SECTION_IDS = SECTIONS.map((section) => section.id)
```

- [ ] **Step 4: Poses sin three** — `src/scene/poses.js`:

```js
// Pure data + selectors, safe for the main chunk (no three.js import).
export const CAMERA_POSES = {
  'hero-q1': { position: [-0.45, 1.14, 1.4], target: [-0.45, 1.14, -0.22], parallax: 0.35 },
  'hero-q2': { position: [-0.38, 1.12, 1.25], target: [-0.38, 1.12, -0.22], parallax: 0.35 },
  'hero-q3': { position: [0.36, 1.18, 0.74], target: [0.46, 0.78, 0.2], parallax: 0.3 },
  'hero-q4': { position: [-0.9, 1.4, 3.9], target: [-1.0, 1.0, 0] },
  'service-web': { position: [-0.45, 1.14, 1.4], target: [-0.45, 1.14, -0.22], parallax: 0.35 },
  'service-tool': { position: [-0.38, 1.12, 1.25], target: [-0.38, 1.12, -0.22], parallax: 0.35 },
  'service-app': { position: [0.36, 1.18, 0.74], target: [0.46, 0.78, 0.2], parallax: 0.3 },
  process: { position: [2.4, 2.3, 2.8], target: [0, 0.9, 0] },
  about: { position: [-2.6, 1.9, 2.4], target: [0, 0.95, 0] },
  case: { position: [2.8, 1.5, 1.4], target: [0, 1.0, 0] },
  brief: { position: [0, 2.6, 5.4], target: [0, 0.9, 0] },
}

export const DEFAULT_POSE = 'hero-q4'

// Home section ids (DOM) plus the 'case' page section used by case, legal and 404 pages.
export const SECTION_POSES = {
  hero: 'hero-q4',
  servicios: 'service-web',
  casos: 'case',
  proceso: 'process',
  'quien-soy': 'about',
  ahora: 'about',
  brief: 'brief',
  case: 'case',
}

export const DIMMED_POSES = new Set(['process', 'case'])

const MAIN_SCREENS = {
  'hero-q1': 'site-build',
  'service-web': 'site-build',
  'hero-q2': 'dashboard',
  'service-tool': 'dashboard',
}

export function resolvePoseId({ section, sceneCue }) {
  if (sceneCue && Object.hasOwn(CAMERA_POSES, sceneCue)) return sceneCue
  return SECTION_POSES[section] ?? DEFAULT_POSE
}

export function mainScreenFor(poseId) {
  return MAIN_SCREENS[poseId] ?? 'code'
}

export function isPhoneLit(poseId) {
  return poseId !== 'hero-q1' && poseId !== 'hero-q2'
}
```

- [ ] **Step 5: Store** — `src/store/sceneStore.js` (reemplazar entero):

```js
import { create } from 'zustand'
import { resolvePoseId } from '../scene/poses'

export const TIERS = ['static', 'low', 'medium', 'high']

export const useSceneStore = create((set, get) => ({
  section: 'hero',
  sceneCue: null,
  tier: null,
  lampOn: true,
  setSection: (section) => set({ section }),
  setSceneCue: (sceneCue) => set({ sceneCue }),
  releaseSceneCue: (cue) => {
    if (get().sceneCue === cue) set({ sceneCue: null })
  },
  setTier: (tier) => set({ tier }),
  downgrade: () => {
    const index = TIERS.indexOf(get().tier)
    if (index > 1) set({ tier: TIERS[index - 1] })
  },
  toggleLamp: () => set((state) => ({ lampOn: !state.lampOn })),
}))

export const selectPoseId = (state) => resolvePoseId(state)

// Dev-only handle for visual checks: __scene.getState().setSceneCue('hero-q3')
if (import.meta.env.DEV && typeof window !== 'undefined') window.__scene = useSceneStore
```

- [ ] **Step 6: Cámara y capa**

`src/scene/cameraPoses.js` (reemplazar entero):

```js
import { MathUtils } from 'three'
import { CAMERA_POSES, DEFAULT_POSE } from './poses'

export { CAMERA_POSES }

export function getPose(id) {
  return CAMERA_POSES[id] ?? CAMERA_POSES[DEFAULT_POSE]
}

export function dampVec3(current, target, lambda, delta) {
  current.x = MathUtils.damp(current.x, target[0], lambda, delta)
  current.y = MathUtils.damp(current.y, target[1], lambda, delta)
  current.z = MathUtils.damp(current.z, target[2], lambda, delta)
  return current
}
```

`src/scene/CameraRig.jsx` (reemplazar entero). Con reduced motion la cámara salta (lambda enorme) a la pose que toque, sin vuelo ni paralaje:

```jsx
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { selectPoseId, useSceneStore } from '../store/sceneStore'
import { dampVec3, getPose } from './cameraPoses'
import { DEFAULT_POSE } from './poses'

export default function CameraRig({ reducedMotion }) {
  const camera = useThree((state) => state.camera)
  const lookAt = useRef(new Vector3(...getPose(DEFAULT_POSE).target))

  useFrame((state, delta) => {
    const pose = getPose(selectPoseId(useSceneStore.getState()))
    const parallax = reducedMotion ? 0 : (pose.parallax ?? 1)
    const px = state.pointer.x * 0.18 * parallax
    const py = state.pointer.y * 0.1 * parallax
    const lambda = reducedMotion ? 1000 : 2.2
    dampVec3(camera.position, [pose.position[0] + px, pose.position[1] + py, pose.position[2]], lambda, delta)
    dampVec3(lookAt.current, pose.target, lambda, delta)
    camera.lookAt(lookAt.current)
  })

  return null
}
```

En `src/scene/SceneCanvas.jsx`: cambiar `camera={{ position: getPose('hero').position, ...` por `camera={{ position: getPose('hero-q4').position, ...`.

`src/scene/SceneLayer.jsx`: sustituir `import { DIMMED_SECTIONS } from './layout'` por `import { DIMMED_POSES, resolvePoseId } from './poses'` y la línea del selector por:

```jsx
  const dimmed = useSceneStore((state) => DIMMED_POSES.has(resolvePoseId(state)))
```

`src/scene/layout.js` (reemplazar entero):

```js
export const DESK = { width: 2.4, depth: 0.9, height: 0.75, top: 0.04 }
export const DESK_TOP = DESK.height
export const MAIN_SCREEN = { position: [0, 1.12, -0.22], size: [1.06, 0.38] }
export const SIDE_SCREEN = { position: [0.95, 1.16, -0.18], rotationY: -0.45, size: [0.34, 0.6] }
export const LAMP_HEAD = [-0.64, 1.22, -0.22]
export const PHONE = { position: [0.62, DESK_TOP, 0.22], rotationY: -0.3, size: [0.075, 0.155] }
export const NOTEBOOK = { position: [-0.5, DESK_TOP, 0.24], rotationY: 0.22, size: [0.15, 0.21] }
```

- [ ] **Step 7: Monitor principal según la pose** — `src/scene/Monitors.jsx`: reemplazar los imports y el cuerpo de `Monitors` (los componentes `Screen` y `Stand` no cambian):

```jsx
import { selectPoseId, useSceneStore } from '../store/sceneStore'
import { useLang } from '../i18n/useLang'
import { useCanvasTexture } from './useCanvasTexture'
import { DESK_TOP, MAIN_SCREEN, SIDE_SCREEN } from './layout'
import { mainScreenFor } from './poses'
import { SCREENS } from './screens'
import { drawTerminal } from './screens/terminal'
```

```jsx
export default function Monitors({ reducedMotion }) {
  const lang = useLang()
  const screenId = useSceneStore((state) => mainScreenFor(selectPoseId(state)))

  const main = useCanvasTexture({
    width: 1024,
    height: 368,
    fps: 24,
    animate: !reducedMotion,
    draw: (ctx, time, w, h) => SCREENS[screenId].draw(ctx, time, w, h, reducedMotion, lang),
  })
  const side = useCanvasTexture({
    width: 384,
    height: 680,
    fps: 8,
    animate: !reducedMotion,
    draw: (ctx, time, w, h) => drawTerminal(ctx, time, w, h, reducedMotion),
  })

  const mainBottom = MAIN_SCREEN.position[1] - MAIN_SCREEN.size[1] / 2
  const sideBottom = SIDE_SCREEN.position[1] - SIDE_SCREEN.size[1] / 2

  return (
    <group>
      <group position={MAIN_SCREEN.position}>
        <Screen size={MAIN_SCREEN.size} texture={main} />
        <group position={[0, -MAIN_SCREEN.size[1] / 2, 0]}>
          <Stand height={mainBottom - DESK_TOP} />
        </group>
      </group>
      <group position={SIDE_SCREEN.position} rotation={[0, SIDE_SCREEN.rotationY, 0]}>
        <Screen size={SIDE_SCREEN.size} texture={side} />
        <group position={[0, -SIDE_SCREEN.size[1] / 2, 0]}>
          <Stand height={sideBottom - DESK_TOP} />
        </group>
      </group>
    </group>
  )
}
```

- [ ] **Step 8: Props nuevos**

`src/scene/props/Phone.jsx`:

```jsx
import { RoundedBox } from '@react-three/drei'
import { isPhoneLit } from '../poses'
import { selectPoseId, useSceneStore } from '../../store/sceneStore'
import { useLang } from '../../i18n/useLang'
import { useCanvasTexture } from '../useCanvasTexture'
import { SCREENS } from '../screens'
import { PHONE } from '../layout'

const BODY_HEIGHT = 0.009

export default function Phone({ reducedMotion }) {
  const lang = useLang()
  const lit = useSceneStore((state) => isPhoneLit(selectPoseId(state)))
  const { width, height, draw } = SCREENS.seenat
  const texture = useCanvasTexture({
    width,
    height,
    fps: 20,
    animate: lit && !reducedMotion,
    draw: (ctx, time, w, h) => draw(ctx, time, w, h, reducedMotion, lang),
  })
  const [w, d] = PHONE.size

  return (
    <group position={PHONE.position} rotation={[0, PHONE.rotationY, 0]}>
      <RoundedBox args={[w, BODY_HEIGHT, d]} radius={0.004} smoothness={3} position={[0, BODY_HEIGHT / 2, 0]} castShadow>
        <meshStandardMaterial color="#0d1017" metalness={0.4} roughness={0.35} />
      </RoundedBox>
      <mesh position={[0, BODY_HEIGHT + 0.0002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w - 0.006, d - 0.008]} />
        {lit ? (
          <meshBasicMaterial map={texture} toneMapped={false} />
        ) : (
          <meshStandardMaterial color="#05060a" metalness={0.6} roughness={0.2} />
        )}
      </mesh>
    </group>
  )
}
```

`src/scene/props/Notebook.jsx`:

```jsx
import { NOTEBOOK } from '../layout'

export default function Notebook() {
  const [w, d] = NOTEBOOK.size
  return (
    <group position={NOTEBOOK.position} rotation={[0, NOTEBOOK.rotationY, 0]}>
      <mesh position={[0, 0.006, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, 0.012, d]} />
        <meshStandardMaterial color="#e8e2d4" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.0125, 0]} castShadow>
        <boxGeometry args={[w + 0.004, 0.002, d + 0.004]} />
        <meshStandardMaterial color="#2a2350" roughness={0.6} />
      </mesh>
      <mesh position={[w * 0.32, 0.0138, 0]}>
        <boxGeometry args={[0.006, 0.0012, d + 0.006]} />
        <meshBasicMaterial color="#7c5cff" toneMapped={false} />
      </mesh>
      <mesh position={[w / 2 + 0.022, 0.005, 0]} rotation={[Math.PI / 2, 0, 0.1]} castShadow>
        <cylinderGeometry args={[0.004, 0.004, 0.14, 10]} />
        <meshStandardMaterial color="#141824" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  )
}
```

`src/scene/props/Props.jsx` (reemplazar entero):

```jsx
import Mug from './Mug'
import Lamp from './Lamp'
import Headphones from './Headphones'
import Tower from './Tower'
import Phone from './Phone'
import Notebook from './Notebook'
import { DeskPlant, OliveTree } from './Plants'

export default function Props({ reducedMotion, sparkles }) {
  return (
    <>
      <Mug reducedMotion={reducedMotion} />
      <Lamp reducedMotion={reducedMotion} sparkles={sparkles} />
      <Headphones />
      <Tower />
      <Phone reducedMotion={reducedMotion} />
      <Notebook />
      <DeskPlant />
      <OliveTree />
    </>
  )
}
```

- [ ] **Step 9: Tests, lint, build y chunk check**

Run: `npm test && npm run lint && npm run build`
Expected: todo en verde.

Run (bucle de la Tarea 1, Paso 12):

```bash
for f in $(grep -oE '/assets/[^"]+\.js' build/client/index.html | sort -u); do printf '%s %s\n' "$f" "$(grep -c __THREE_DEVTOOLS__ "build/client$f")"; done
```

Expected: todas las líneas terminan en ` 0` (`poses.js` y el store no importan three).

- [ ] **Step 10: Ajuste visual de poses y props (juicio visual)**

`npm run dev`, abrir `http://localhost:5173/?scene=high` a 1440×900 y 1024×768. En la consola del navegador recorrer las poses con `__scene.getState().setSceneCue('hero-q1')`, `'hero-q2'`, `'hero-q3'`, `'service-app'`, `null`, y `__scene.getState().setSection('proceso')` / `'case'` / `'brief'`. Criterios:
  - `hero-q1`/`service-web`: el monitor principal ocupa la mitad derecha y se ve la web maquetándose; `hero-q2`/`service-tool`: el panel de SolarMetrics.
  - `hero-q3`/`service-app`: el móvil (encendido con Seenat) ocupa la mitad derecha, legible, sin cortarse a 1024.
  - El móvil y la libreta no atraviesan el teclado, la alfombrilla, la taza ni la planta, y proyectan sombra en `high`.
  - `process` y `case` atenúan la capa (`data-dimmed="true"`).
  Si algo no encaja, ajustar solo los números de `CAMERA_POSES`, `PHONE` o `NOTEBOOK` y repetir `npm test`.

- [ ] **Step 11: Commit**

```bash
git add src/data/sections.js src/data/data.test.js src/store/sceneStore.js src/store/sceneStore.test.js src/scene/poses.js src/scene/poses.test.js src/scene/cameraPoses.js src/scene/cameraPoses.test.js src/scene/CameraRig.jsx src/scene/SceneCanvas.jsx src/scene/SceneLayer.jsx src/scene/SceneLayer.test.jsx src/scene/Monitors.jsx src/scene/layout.js src/scene/props/Phone.jsx src/scene/props/Notebook.jsx src/scene/props/Props.jsx src/components/Navbar.test.jsx
git commit -m "Drive the camera with scene cues and add the phone and notebook props

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Base de interfaz — tokens de movimiento, Navbar v2, pie y escena por página

> **Tipo:** transcripción con comprobación visual ligera. Modelo económico.

**Files:**
- Modify: `src/styles/tokens.css`, `src/styles/global.css`, `src/data/sections.js`, `src/components/Navbar.jsx`, `src/components/Navbar.test.jsx`, `src/components/css/Navbar.css`, `src/components/Footer.jsx`, `src/components/Footer.test.jsx`, `src/components/css/Footer.css`, `src/routes/not-found.jsx`, `src/i18n/strings.js`
- Create: `src/components/SectionLink.jsx`, `src/hooks/usePageScene.js`, `src/hooks/usePageScene.test.js`

**Interfaces:**
- Consumes: `renderWithRouter` (Tarea 1), `SECTIONS` y store (Tarea 4).
- Produces:
  - `NAV_ITEMS: Array<{ id, label, enabled: boolean, to? }>` en `src/data/sections.js` (Lab con `enabled: false`, `to: '/lab'`).
  - `<SectionLink id ...props>`: `<a href="#id">` en `/`; `<Link to="/#id">` (o `/` para `hero`) en el resto de rutas.
  - `usePageScene(section)`: pone `section` en el store al montar (páginas de caso, legal y 404 usan `'case'`).
  - Strings `ctaBrief`, `brandLabel`, `footerPrivacy`, `footerLegal`.
  - Tokens CSS `--ease-out`, `--ease-in-out`, `--ease-drawer`, `--dur-press`, `--dur-ui`, `--dur-panel`.

- [ ] **Step 1: Escribir los tests que fallan**

`src/components/Navbar.test.jsx` (reemplazar entero):

```jsx
import { act, fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import Navbar from './Navbar'
import { renderWithRouter } from '../test/router'
import { useSceneStore } from '../store/sceneStore'

beforeEach(() => {
  useSceneStore.setState(useSceneStore.getInitialState(), true)
})

const sectionLinks = () =>
  screen.getAllByRole('listitem').map((item) => item.querySelector('a')).filter((a) => !a.classList.contains('navbar-cta'))

describe('Navbar', () => {
  it('links to the home sections with anchors while on the home page', () => {
    renderWithRouter(<Navbar />)
    expect(sectionLinks().map((a) => a.getAttribute('href'))).toEqual(['#servicios', '#casos', '#proceso', '#quien-soy'])
    expect(screen.getByRole('link', { name: 'Cuéntame tu proyecto' })).toHaveAttribute('href', '#brief')
    expect(screen.getByRole('link', { name: 'Inicio · Miguel Ángel' })).toHaveAttribute('href', '#hero')
  })

  it('goes back to the home page sections from any other page', () => {
    renderWithRouter(<Navbar />, { route: '/casos/seenat' })
    expect(sectionLinks().map((a) => a.getAttribute('href'))).toEqual([
      '/#servicios',
      '/#casos',
      '/#proceso',
      '/#quien-soy',
    ])
    expect(screen.getByRole('link', { name: 'Cuéntame tu proyecto' })).toHaveAttribute('href', '/#brief')
    expect(screen.getByRole('link', { name: 'Inicio · Miguel Ángel' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Casos' })).toHaveAttribute('aria-current', 'true')
  })

  it('hides the Lab until phase B', () => {
    renderWithRouter(<Navbar />)
    expect(screen.queryByRole('link', { name: 'Lab' })).not.toBeInTheDocument()
  })

  it('opens the mobile menu and closes it after choosing a link', () => {
    renderWithRouter(<Navbar />)
    const toggle = screen.getByRole('button', { name: 'Abrir menú' })
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(toggle).toHaveAccessibleName('Cerrar menú')
    fireEvent.click(screen.getByRole('link', { name: 'Casos' }))
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes the mobile menu with Escape', () => {
    renderWithRouter(<Navbar />)
    const toggle = screen.getByRole('button', { name: 'Abrir menú' })
    fireEvent.click(toggle)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('marks the active section on the home page', () => {
    renderWithRouter(<Navbar />)
    act(() => useSceneStore.getState().setSection('proceso'))
    expect(screen.getByRole('link', { name: 'Cómo trabajo' })).toHaveAttribute('aria-current', 'true')
    expect(screen.getByRole('link', { name: 'Casos' })).not.toHaveAttribute('aria-current')
  })

  it('is inert until the page is ready', () => {
    const view = renderWithRouter(<Navbar ready={false} />)
    expect(document.querySelector('header')).toHaveAttribute('inert')
    view.unmount()
    renderWithRouter(<Navbar ready />)
    expect(document.querySelector('header')).not.toHaveAttribute('inert')
  })

  it('offers a skip link to the main content', () => {
    renderWithRouter(<Navbar />)
    expect(screen.getByRole('link', { name: 'Saltar al contenido' })).toHaveAttribute('href', '#main')
  })
})
```

`src/components/Footer.test.jsx` (reemplazar entero):

```jsx
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Footer from './Footer'
import { renderWithRouter } from '../test/router'

describe('Footer', () => {
  it('shows the copyright, the legal pages and my profiles', () => {
    renderWithRouter(<Footer />)
    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveTextContent(`© ${new Date().getFullYear()} Miguel Ángel Domínguez García`)
    expect(screen.getByRole('link', { name: 'Privacidad' })).toHaveAttribute('href', '/privacidad')
    expect(screen.getByRole('link', { name: 'Aviso legal' })).toHaveAttribute('href', '/aviso-legal')
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('target', '_blank')
    expect(footer).toHaveTextContent('Hecho con React y Three.js')
  })
})
```

`src/hooks/usePageScene.test.js`:

```js
import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useSceneStore } from '../store/sceneStore'
import { usePageScene } from './usePageScene'

beforeEach(() => {
  useSceneStore.setState(useSceneStore.getInitialState(), true)
})

describe('usePageScene', () => {
  it('tells the scene which page is showing', () => {
    renderHook(() => usePageScene('case'))
    expect(useSceneStore.getState().section).toBe('case')
  })
})
```

- [ ] **Step 2: Ejecutar y verlos fallar**

Run: `npx vitest run src/components/Navbar.test.jsx src/components/Footer.test.jsx src/hooks/usePageScene.test.js`
Expected: FAIL — falta el CTA, los hrefs siguen siendo los antiguos, no hay enlaces legales y `./usePageScene` no existe.

- [ ] **Step 3: Tokens y reglas globales de movimiento**

`src/styles/tokens.css`: sustituir la línea `--ease-out: cubic-bezier(0.22, 1, 0.36, 1);` por:

```css
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
  --dur-press: 140ms;
  --dur-ui: 220ms;
  --dur-panel: 400ms;
```

`src/styles/global.css`:
  - Sustituir las reglas `.btn { ... }`, `.btn:hover { ... }`, `.btn-primary { ... }` y `.btn-primary:hover { ... }` por:

```css
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.8rem 1.35rem;
  border: 1px solid var(--border-strong);
  border-radius: 999px;
  background: rgba(7, 8, 13, 0.4);
  color: var(--text);
  font: 600 0.95rem/1 var(--font-body);
  cursor: pointer;
  transition:
    transform var(--dur-press) var(--ease-out),
    translate var(--dur-ui) var(--ease-out),
    background-color var(--dur-ui) var(--ease-out),
    border-color var(--dur-ui) var(--ease-out),
    box-shadow var(--dur-ui) var(--ease-out);
}

.btn:active {
  transform: scale(0.97);
}

.btn-primary {
  background: var(--accent);
  border-color: var(--accent);
  color: #041016;
}

@media (hover: hover) and (pointer: fine) {
  .btn:hover {
    border-color: var(--accent);
    box-shadow: 0 0 24px rgba(0, 229, 255, 0.18);
  }

  .btn-primary:hover {
    background: #5cf0ff;
    box-shadow: 0 0 32px rgba(0, 229, 255, 0.45);
  }
}
```

  - En `[data-tilt]`, cambiar `transition: rotate 0.35s var(--ease-out);` por `transition: rotate var(--dur-ui) var(--ease-out);`.
  - Sustituir el bloque final `@media (prefers-reduced-motion: reduce) { ... }` por (los fundidos y colores se conservan; los desplazamientos pasan a ser instantáneos):

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-property: opacity, color, background-color, border-color, box-shadow !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 4: Navegación** — añadir a `src/data/sections.js`:

```js
// Navbar items. The Lab arrives in phase B (spec §3): keep it here, disabled.
export const NAV_ITEMS = [
  { id: 'servicios', label: { es: 'Servicios', en: 'Services' }, enabled: true },
  { id: 'casos', label: { es: 'Casos', en: 'Case studies' }, enabled: true },
  { id: 'proceso', label: { es: 'Cómo trabajo', en: 'How I work' }, enabled: true },
  { id: 'quien-soy', label: { es: 'Quién soy', en: 'About me' }, enabled: true },
  { id: 'lab', label: { es: 'Lab', en: 'Lab' }, to: '/lab', enabled: false },
]
```

Añadir a `src/i18n/strings.js`:

```js
  ctaBrief: { es: 'Cuéntame tu proyecto', en: 'Tell me about your project' },
  brandLabel: { es: 'Inicio · Miguel Ángel', en: 'Home · Miguel Ángel' },
  footerPrivacy: { es: 'Privacidad', en: 'Privacy' },
  footerLegal: { es: 'Aviso legal', en: 'Legal notice' },
```

`src/components/SectionLink.jsx`:

```jsx
import { Link, useLocation } from 'react-router'

// On the home page a plain anchor lets Lenis scroll smoothly; elsewhere, go back home to that section.
export default function SectionLink({ id, children, ...props }) {
  const { pathname } = useLocation()
  if (pathname === '/') {
    return (
      <a href={`#${id}`} {...props}>
        {children}
      </a>
    )
  }
  return (
    <Link to={id === 'hero' ? '/' : `/#${id}`} {...props}>
      {children}
    </Link>
  )
}
```

`src/components/Navbar.jsx` (reemplazar entero):

```jsx
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
```

`src/components/css/Navbar.css`:
  - En `.navbar` cambiar `transition: background 0.3s, border-color 0.3s;` por `transition: background-color var(--dur-ui) var(--ease-out), border-color var(--dur-ui) var(--ease-out);`.
  - En `.navbar-links` añadir `align-items: center;`.
  - En `.navbar-links a` cambiar `transition: color 0.2s;` por `transition: color var(--dur-ui) var(--ease-out);`; en `.navbar-links a::after` cambiar `transition: transform 0.3s var(--ease-out);` por `transition: transform var(--dur-ui) var(--ease-out);`.
  - Sustituir `.navbar-links a:hover, .navbar-links a[aria-current='true'] {...}` y `.navbar-links a:hover::after, ...::after {...}` por:

```css
.navbar-links a[aria-current='true'] {
  color: var(--text);
}

.navbar-links a[aria-current='true']::after {
  transform: scaleX(1);
}

@media (hover: hover) and (pointer: fine) {
  .navbar-links a:hover {
    color: var(--text);
  }

  .navbar-links a:hover::after {
    transform: scaleX(1);
  }
}

.navbar-links .navbar-cta {
  padding: 0.6rem 1.1rem;
  color: #041016;
  font-size: 0.9rem;
}

.navbar-links .navbar-cta::after {
  display: none;
}
```

  - Dentro de `@media (max-width: 767px)`: en `.navbar-links` cambiar `transition: opacity 0.25s, transform 0.25s, visibility 0.25s;` por `transition: opacity var(--dur-ui) var(--ease-out), transform var(--dur-ui) var(--ease-out), visibility var(--dur-ui);` y `align-items: center` por `align-items: stretch`; añadir al final del bloque:

```css
  .navbar-cta-item {
    margin-top: 0.75rem;
  }

  .navbar-links .navbar-cta {
    justify-content: center;
    width: 100%;
    padding: 0.9rem 1.1rem;
  }
```

- [ ] **Step 5: Pie** — `src/components/Footer.jsx` (reemplazar entero):

```jsx
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
          © {new Date().getFullYear()} {profile.name}
        </p>
        <ul className="footer-links">
          <li>
            <Link to="/privacidad">{t('footerPrivacy')}</Link>
          </li>
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
        <p className="mono">{t('footerBuilt')}</p>
      </div>
    </footer>
  )
}
```

`src/components/css/Footer.css` (reemplazar entero):

```css
.footer {
  position: relative;
  z-index: 1;
  border-top: 1px solid var(--border);
  background: rgba(7, 8, 13, 0.6);
  color: var(--text-muted);
  font-size: 0.85rem;
}

.footer-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 1.5rem;
  padding-block: 1.5rem 2rem;
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.25rem;
}

.footer-links a {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 44px;
  transition: color var(--dur-ui) var(--ease-out);
}

@media (hover: hover) and (pointer: fine) {
  .footer-links a:hover {
    color: var(--text);
  }
}
```

- [ ] **Step 6: Escena por página** — `src/hooks/usePageScene.js`:

```js
import { useEffect } from 'react'
import { useSceneStore } from '../store/sceneStore'

export function usePageScene(section) {
  const setSection = useSceneStore((state) => state.setSection)
  useEffect(() => {
    setSection(section)
  }, [section, setSection])
}
```

En `src/routes/not-found.jsx`: importar `import { usePageScene } from '../hooks/usePageScene'` y llamar `usePageScene('case')` como primera línea de `NotFound`.

- [ ] **Step 7: Tests, lint, build**

Run: `npm test && npm run lint && npm run build`
Expected: todo en verde.

- [ ] **Step 8: Comprobación visual**

`npm run dev`: a 1440 la barra muestra Servicios · Casos · Cómo trabajo · Quién soy y el botón cian "Cuéntame tu proyecto"; a 375 el menú lo muestra a lo ancho al final. Botones: al pulsar encogen (`scale(0.97)`); el hover solo aparece con ratón. En `/no-existe` el pie enlaza a Privacidad / Aviso legal (aún 404, llegan en la Tarea 16) y la escena se atenúa.

- [ ] **Step 9: Commit**

```bash
git add src/styles/tokens.css src/styles/global.css src/data/sections.js src/components/SectionLink.jsx src/components/Navbar.jsx src/components/Navbar.test.jsx src/components/css/Navbar.css src/components/Footer.jsx src/components/Footer.test.jsx src/components/css/Footer.css src/hooks/usePageScene.js src/hooks/usePageScene.test.js src/routes/not-found.jsx src/i18n/strings.js
git commit -m "Add motion tokens, the client navbar, the new footer and per-page scene

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---
### Task 6: Hero — secuencia de preguntas

> **Tipo:** integración con juicio visual (timing, CSS de máscaras y barrido). Modelo capaz.

**Files:**
- Create: `src/hooks/useHeroSequence.js`, `src/hooks/useHeroSequence.test.js`, `src/hooks/useSceneCue.js`, `src/hooks/useSceneCue.test.js`, `src/components/SplitWords.jsx`, `src/components/SplitWords.test.jsx`, `src/components/css/SplitWords.css`
- Modify: `src/components/Hero.jsx`, `src/components/Hero.test.jsx`, `src/components/css/Hero.css`, `src/components/HeroPortrait.jsx`, `src/data/profile.js`, `src/data/data.test.js`, `src/i18n/strings.js`
- Delete: `src/hooks/useTypewriter.js`, `src/hooks/useTypewriter.test.js`

**Interfaces:**
- Consumes: `profile.hero` (Tarea 2), `setSceneCue` / `releaseSceneCue` (Tarea 4), `ctaBrief` (Tarea 5).
- Produces:
  - `useHeroSequence({ running, reducedMotion }) → { moment: 1|2|3|4, instant: boolean }`; constantes `HERO_MOMENTS_MS = [0, 1700, 3400, 5100]`, `FINAL_MOMENT = 4`, `HERO_SEEN_KEY = 'mdg:hero-seen'`.
  - `useSceneCue(cue: string|null)`: pone el cue mientras no sea `null` y suelta exactamente el suyo al cambiar o desmontar.
  - `<SplitWords text mask? className? />`: una `span.w` por palabra (con `span.w-inner` si `mask`), espacios reales entre palabras y `--i` = índice. CSS compartido: `.w-mask`, `@keyframes word-in`.
  - `<HeroPortrait reducedMotion visible />`.
  - `#hero` expone `data-moment`, `data-reduced`, `data-instant` (los usan los e2e).
  - String `heroCtaCases`.

- [ ] **Step 1: Escribir los tests que fallan**

`src/hooks/useSceneCue.test.js`:

```js
import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useSceneStore } from '../store/sceneStore'
import { useSceneCue } from './useSceneCue'

beforeEach(() => {
  useSceneStore.setState(useSceneStore.getInitialState(), true)
})

describe('useSceneCue', () => {
  it('sets the cue, swaps it and releases it on unmount', () => {
    const { rerender, unmount } = renderHook(({ cue }) => useSceneCue(cue), { initialProps: { cue: 'hero-q1' } })
    expect(useSceneStore.getState().sceneCue).toBe('hero-q1')
    rerender({ cue: 'hero-q2' })
    expect(useSceneStore.getState().sceneCue).toBe('hero-q2')
    rerender({ cue: null })
    expect(useSceneStore.getState().sceneCue).toBeNull()
    rerender({ cue: 'service-web' })
    unmount()
    expect(useSceneStore.getState().sceneCue).toBeNull()
  })

  it('never clears a cue that belongs to someone else', () => {
    const { unmount } = renderHook(() => useSceneCue('hero-q1'))
    useSceneStore.getState().setSceneCue('service-app')
    unmount()
    expect(useSceneStore.getState().sceneCue).toBe('service-app')
  })
})
```

`src/hooks/useHeroSequence.test.js`:

```js
import { act, fireEvent, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HERO_SEEN_KEY, useHeroSequence } from './useHeroSequence'

beforeEach(() => {
  window.sessionStorage.clear()
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

const run = (props) =>
  renderHook((p) => useHeroSequence(p), { initialProps: { running: true, reducedMotion: false, ...props } })

describe('useHeroSequence', () => {
  it('waits for the page to be ready before playing', () => {
    vi.useFakeTimers()
    const { result, rerender } = run({ running: false })
    act(() => vi.advanceTimersByTime(8000))
    expect(result.current.moment).toBe(1)
    rerender({ running: true, reducedMotion: false })
    act(() => vi.advanceTimersByTime(1700))
    expect(result.current.moment).toBe(2)
  })

  it('plays the four moments in about five seconds and remembers it for the session', () => {
    vi.useFakeTimers()
    const { result } = run()
    expect(result.current).toEqual({ moment: 1, instant: false })
    act(() => vi.advanceTimersByTime(1700))
    expect(result.current.moment).toBe(2)
    act(() => vi.advanceTimersByTime(1700))
    expect(result.current.moment).toBe(3)
    act(() => vi.advanceTimersByTime(1700))
    expect(result.current.moment).toBe(4)
    expect(window.sessionStorage.getItem(HERO_SEEN_KEY)).toBe('1')
  })

  it('skips to the end on a key press, without animation', () => {
    const { result } = run()
    fireEvent.keyDown(window, { key: 'Tab' })
    expect(result.current).toEqual({ moment: 4, instant: true })
  })

  it('skips to the end on scroll, wheel, touch or click, keeping the animation', () => {
    for (const fire of [
      () => fireEvent.wheel(window),
      () => fireEvent.scroll(window),
      () => fireEvent.touchStart(window),
      () => fireEvent.pointerDown(window),
    ]) {
      window.sessionStorage.clear()
      const { result, unmount } = run()
      fire()
      expect(result.current).toEqual({ moment: 4, instant: false })
      unmount()
    }
  })

  it('starts at the end with reduced motion or when already seen this session', () => {
    expect(run({ reducedMotion: true }).result.current.moment).toBe(4)
    window.sessionStorage.setItem(HERO_SEEN_KEY, '1')
    expect(run().result.current.moment).toBe(4)
  })

  it('still plays when sessionStorage is blocked', () => {
    vi.useFakeTimers()
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    const { result } = run()
    expect(result.current.moment).toBe(1)
    // One act per moment: each step schedules the next timer after React re-renders.
    for (let step = 0; step < 3; step += 1) act(() => vi.advanceTimersByTime(1700))
    expect(result.current.moment).toBe(4)
  })
})
```

`src/components/SplitWords.test.jsx`:

```jsx
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SplitWords from './SplitWords'

describe('SplitWords', () => {
  it('wraps every word but keeps the sentence intact for assistive tech', () => {
    const { container } = render(<SplitWords text="Te la  construyo." />)
    expect(container.textContent).toBe('Te la construyo.')
    expect(container.querySelectorAll('.w')).toHaveLength(3)
    expect(container.querySelector('.w-inner')).toBeNull()
  })

  it('adds an inner span to mask each word', () => {
    const { container } = render(<SplitWords text="A medida." mask />)
    expect(container.querySelectorAll('.w.w-mask > .w-inner')).toHaveLength(2)
    expect(container.querySelectorAll('.w')[1].style.getPropertyValue('--i')).toBe('1')
  })
})
```

`src/components/Hero.test.jsx` (reemplazar entero):

```jsx
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Hero from './Hero'
import { useSceneStore } from '../store/sceneStore'
import { HERO_SEEN_KEY } from '../hooks/useHeroSequence'

beforeEach(() => {
  useSceneStore.setState(useSceneStore.getInitialState(), true)
  window.sessionStorage.clear()
})

afterEach(() => vi.useRealTimers())

const hero = () => document.getElementById('hero')

describe('Hero', () => {
  it('puts the questions, the answer and the calls to action in the HTML', () => {
    render(<Hero ready reducedMotion />)
    const questions = within(screen.getByRole('list')).getAllByRole('listitem').map((item) => item.textContent)
    expect(questions).toEqual([
      '¿Necesitas una web que te traiga clientes?',
      '¿Una herramienta que sustituya tus Excel?',
      '¿Una app que tus usuarios lleven en el bolsillo?',
    ])
    expect(screen.getByRole('heading', { level: 1, name: 'Te la construyo. A medida.' })).toBeInTheDocument()
    expect(screen.getByText(/^Soy Miguel Ángel, desarrollador web\./)).toBeInTheDocument()
    expect(screen.getByText('Web Developer en Macrosad · Creador de Seenat y SolarMetrics')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Cuéntame tu proyecto' })).toHaveAttribute('href', '#brief')
    expect(screen.getByRole('link', { name: 'Ver casos' })).toHaveAttribute('href', '#casos')
    expect(screen.getByRole('img', { name: 'Miguel Ángel con los brazos cruzados' })).toBeInTheDocument()
  })

  it('shows everything at once with reduced motion and leaves the camera on the open desk', () => {
    render(<Hero ready reducedMotion />)
    expect(hero()).toHaveAttribute('data-moment', '4')
    expect(hero()).toHaveAttribute('data-reduced', 'true')
    expect(useSceneStore.getState().sceneCue).toBeNull()
  })

  it('plays the questions in order, moving the camera, then settles on the answer', () => {
    vi.useFakeTimers()
    render(<Hero ready reducedMotion={false} />)
    expect(hero()).toHaveAttribute('data-moment', '1')
    expect(useSceneStore.getState().sceneCue).toBe('hero-q1')
    act(() => vi.advanceTimersByTime(1700))
    expect(useSceneStore.getState().sceneCue).toBe('hero-q2')
    act(() => vi.advanceTimersByTime(1700))
    expect(useSceneStore.getState().sceneCue).toBe('hero-q3')
    act(() => vi.advanceTimersByTime(1700))
    expect(hero()).toHaveAttribute('data-moment', '4')
    expect(useSceneStore.getState().sceneCue).toBeNull()
    expect(window.sessionStorage.getItem(HERO_SEEN_KEY)).toBe('1')
  })

  it('jumps to the answer without animation when a key is pressed', () => {
    render(<Hero ready reducedMotion={false} />)
    fireEvent.keyDown(window, { key: 'Tab' })
    expect(hero()).toHaveAttribute('data-moment', '4')
    expect(hero()).toHaveAttribute('data-instant', 'true')
  })

  it('starts on the answer when it was already seen in this session', () => {
    window.sessionStorage.setItem(HERO_SEEN_KEY, '1')
    render(<Hero ready reducedMotion={false} />)
    expect(hero()).toHaveAttribute('data-moment', '4')
  })

  it('releases its camera cue when it unmounts', () => {
    const { unmount } = render(<Hero ready reducedMotion={false} />)
    expect(useSceneStore.getState().sceneCue).toBe('hero-q1')
    unmount()
    expect(useSceneStore.getState().sceneCue).toBeNull()
  })
})
```

- [ ] **Step 2: Ejecutar y verlos fallar**

Run: `npx vitest run src/hooks/useSceneCue.test.js src/hooks/useHeroSequence.test.js src/components/SplitWords.test.jsx src/components/Hero.test.jsx`
Expected: FAIL — módulos inexistentes y el hero antiguo sin preguntas.

- [ ] **Step 3: Hooks**

`src/hooks/useSceneCue.js`:

```js
import { useEffect } from 'react'
import { useSceneStore } from '../store/sceneStore'

// Holds a camera cue while `cue` is set; releases only its own cue when it changes or unmounts.
export function useSceneCue(cue) {
  const setSceneCue = useSceneStore((state) => state.setSceneCue)
  const releaseSceneCue = useSceneStore((state) => state.releaseSceneCue)

  useEffect(() => {
    if (!cue) return undefined
    setSceneCue(cue)
    return () => releaseSceneCue(cue)
  }, [cue, setSceneCue, releaseSceneCue])
}
```

`src/hooks/useHeroSequence.js`:

```js
import { useEffect, useLayoutEffect, useState } from 'react'

export const HERO_MOMENTS_MS = [0, 1700, 3400, 5100]
export const FINAL_MOMENT = 4
export const HERO_SEEN_KEY = 'mdg:hero-seen'

const SKIP_EVENTS = ['wheel', 'touchstart', 'pointerdown', 'keydown', 'scroll']

function readSeen() {
  try {
    return window.sessionStorage.getItem(HERO_SEEN_KEY) === '1'
  } catch {
    return false
  }
}

function writeSeen() {
  try {
    window.sessionStorage.setItem(HERO_SEEN_KEY, '1')
  } catch {
    // Storage blocked: the intro simply plays again next time.
  }
}

export function useHeroSequence({ running, reducedMotion }) {
  const [moment, setMoment] = useState(1)
  const [instant, setInstant] = useState(false)
  const done = moment === FINAL_MOMENT

  // Layout effect: decided before the first paint, and only in the browser (prerender shows moment 1).
  useLayoutEffect(() => {
    if (reducedMotion || readSeen()) setMoment(FINAL_MOMENT)
  }, [reducedMotion])

  useEffect(() => {
    if (!running || done) return undefined
    const id = setTimeout(
      () => setMoment((current) => Math.min(FINAL_MOMENT, current + 1)),
      HERO_MOMENTS_MS[moment] - HERO_MOMENTS_MS[moment - 1],
    )
    return () => clearTimeout(id)
  }, [running, done, moment])

  useEffect(() => {
    if (!running || done) return undefined
    const skip = (event) => {
      // Keyboard actions never animate (spec §7).
      setInstant(event.type === 'keydown')
      setMoment(FINAL_MOMENT)
    }
    SKIP_EVENTS.forEach((type) => window.addEventListener(type, skip, { passive: true }))
    return () => SKIP_EVENTS.forEach((type) => window.removeEventListener(type, skip))
  }, [running, done])

  useEffect(() => {
    if (done) writeSeen()
  }, [done])

  return { moment, instant }
}
```

- [ ] **Step 4: `SplitWords`**

`src/components/SplitWords.jsx`:

```jsx
import { Fragment } from 'react'
import './css/SplitWords.css'

export default function SplitWords({ text, mask = false, className }) {
  const words = text.split(/\s+/).filter(Boolean)
  return (
    <span className={className}>
      {words.map((word, index) => (
        <Fragment key={`${index}-${word}`}>
          <span className={mask ? 'w w-mask' : 'w'} style={{ '--i': index }}>
            {mask ? <span className="w-inner">{word}</span> : word}
          </span>
          {index < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </span>
  )
}
```

`src/components/css/SplitWords.css`:

```css
.w {
  display: inline-block;
}

.w-mask {
  overflow: hidden;
  padding-bottom: 0.1em;
  margin-bottom: -0.1em;
  vertical-align: top;
}

.w-inner {
  display: inline-block;
}

@keyframes word-in {
  from {
    transform: translateY(105%);
  }
  to {
    transform: none;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
}
```

- [ ] **Step 5: Hero** — `src/components/Hero.jsx` (reemplazar entero):

```jsx
import { profile } from '../data/profile'
import { localize } from '../data/localize'
import { useLang, useT } from '../i18n/useLang'
import { FINAL_MOMENT, useHeroSequence } from '../hooks/useHeroSequence'
import { useSceneCue } from '../hooks/useSceneCue'
import HeroPortrait from './HeroPortrait'
import SplitWords from './SplitWords'
import './css/Hero.css'

function questionState(index, moment) {
  const own = index + 1
  if (moment === FINAL_MOMENT) return 'settled'
  if (moment === own) return 'active'
  return moment > own ? 'past' : 'upcoming'
}

export default function Hero({ ready, reducedMotion }) {
  const lang = useLang()
  const t = useT()
  const { moment, instant } = useHeroSequence({ running: ready, reducedMotion })
  const final = moment === FINAL_MOMENT
  useSceneCue(final ? null : `hero-q${moment}`)
  const answer = localize(profile.hero.answer, lang)

  return (
    <section
      id="hero"
      className="hero"
      aria-labelledby="hero-title"
      data-moment={moment}
      data-reduced={reducedMotion ? 'true' : 'false'}
      data-instant={instant ? 'true' : 'false'}
    >
      <p className="hero-bgname" aria-hidden="true">
        Miguel Ángel
      </p>
      <div className="container hero-content">
        <ol className="hero-questions">
          {profile.hero.questions.map((question, index) => (
            <li key={question.es} className="hero-q" data-state={questionState(index, moment)} style={{ '--i': index }}>
              <SplitWords text={localize(question, lang)} mask />
            </li>
          ))}
        </ol>
        <h1 id="hero-title" className="hero-answer" data-state={final ? 'active' : 'upcoming'}>
          <SplitWords text={answer} mask />
          <span className="hero-answer-glow" aria-hidden="true">
            <SplitWords text={answer} />
          </span>
        </h1>
        <div className="hero-body" data-visible={final ? 'true' : 'false'}>
          <p className="hero-intro">{localize(profile.hero.intro, lang)}</p>
          <p className="hero-proof mono">{localize(profile.hero.proof, lang)}</p>
          <div className="hero-ctas">
            <a className="btn btn-primary" href="#brief">
              {t('ctaBrief')}
            </a>
            <a className="btn" href="#casos">
              {t('heroCtaCases')}
            </a>
          </div>
        </div>
      </div>
      <HeroPortrait reducedMotion={reducedMotion} visible={final} />
    </section>
  )
}
```

`src/components/HeroPortrait.jsx`: cambiar la firma a `export default function HeroPortrait({ reducedMotion, visible = true })` y el `<div>` raíz a `<div className="hero-portrait" data-visible={visible ? 'true' : 'false'} ref={ref}>`.

- [ ] **Step 6: Estilos del hero** — `src/components/css/Hero.css` (reemplazar entero). Solo se animan `transform`, `opacity`, `clip-path` y `filter`; teclado (`data-instant`) y reduced motion sin keyframes:

```css
.hero {
  position: relative;
  display: grid;
  align-items: center;
  min-height: 100svh;
  padding-block: calc(var(--nav-h) + 2rem) 4rem;
  overflow: hidden;
}

.hero-bgname {
  position: absolute;
  inset: auto 0 4vh;
  z-index: 0;
  font: 700 clamp(4rem, 16vw, 14rem) / 0.86 var(--font-display);
  letter-spacing: -0.03em;
  text-align: center;
  text-transform: uppercase;
  white-space: nowrap;
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(0, 229, 255, 0.12);
  pointer-events: none;
  user-select: none;
}

.hero-content {
  position: relative;
  z-index: 2;
  display: grid;
  justify-items: start;
  gap: 1.25rem;
}

/* During the sequence the three questions share one spot. */
.hero-questions {
  display: grid;
}

.hero-q {
  grid-area: 1 / 1;
  max-width: 18ch;
  font: 600 clamp(2.1rem, 4.8vw, 3.8rem) / 1.08 var(--font-display);
  letter-spacing: -0.01em;
}

.hero-q[data-state='upcoming'] {
  opacity: 0;
}

.hero-q[data-state='upcoming'] .w-inner {
  transform: translateY(105%);
}

.hero-q[data-state='active'] .w-inner {
  animation: word-in 600ms var(--ease-out) both;
  animation-delay: calc(var(--i) * 40ms);
}

.hero-q[data-state='past'] {
  animation: hero-q-out 280ms var(--ease-out) both;
}

/* Final composition (also the reduced-motion layout): the questions settle as a small list. */
.hero[data-moment='4'] .hero-questions {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.hero-q[data-state='settled'] {
  max-width: none;
  font: 500 clamp(1rem, 1.5vw, 1.2rem) / 1.4 var(--font-body);
  color: var(--text-muted);
  animation: fade-in var(--dur-panel) var(--ease-out) both;
  animation-delay: calc(var(--i) * 60ms);
}

.hero-answer {
  position: relative;
  max-width: 14ch;
  font: 700 clamp(2.8rem, 7.4vw, 6rem) / 1 var(--font-display);
  letter-spacing: -0.02em;
}

.hero-answer[data-state='upcoming'] {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.hero-answer[data-state='active'] .w-inner {
  animation: word-in 700ms var(--ease-out) both;
  animation-delay: calc(200ms + var(--i) * 50ms);
}

/* One neon sweep over the answer: a copy of the text revealed by a moving clip-path band. */
.hero-answer-glow {
  position: absolute;
  inset: 0;
  color: var(--accent);
  text-shadow: 0 0 18px rgba(0, 229, 255, 0.8);
  clip-path: inset(0 100% 0 0);
  pointer-events: none;
}

.hero-answer[data-state='active'] .hero-answer-glow {
  animation: hero-glow-sweep 1200ms var(--ease-in-out) 700ms 1 both;
}

.hero-body {
  display: grid;
  gap: 0.9rem;
  max-width: 34rem;
  transition:
    opacity var(--dur-panel) var(--ease-out) 300ms,
    transform var(--dur-panel) var(--ease-out) 300ms;
}

.hero-body[data-visible='false'] {
  opacity: 0;
  transform: translateY(12px);
  pointer-events: none;
}

.hero-intro {
  font-size: clamp(1rem, 1.4vw, 1.15rem);
}

.hero-proof {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.hero-ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

.hero-portrait {
  position: absolute;
  right: max(16px, calc((100vw - var(--container)) / 2));
  bottom: 0;
  z-index: 1;
  width: min(440px, 34vw);
  transition:
    opacity var(--dur-panel) var(--ease-out) 200ms,
    transform var(--dur-panel) var(--ease-out) 200ms;
}

.hero-portrait[data-visible='false'] {
  opacity: 0;
  transform: translateY(24px);
}

.hero-portrait img {
  transform: translate3d(calc(var(--px, 0) * -14px), calc(var(--py, 0) * -8px), 0);
  transition: transform var(--dur-panel) var(--ease-out);
  filter: drop-shadow(0 0 1px rgba(0, 229, 255, 0.9)) drop-shadow(0 0 22px rgba(0, 229, 255, 0.28))
    drop-shadow(-18px 0 40px rgba(124, 92, 255, 0.25));
  -webkit-mask-image: linear-gradient(to bottom, #000 80%, transparent);
  mask-image: linear-gradient(to bottom, #000 80%, transparent);
}

.hero[data-instant='true'] *,
.hero[data-instant='true'] *::before,
.hero[data-instant='true'] *::after {
  animation: none !important;
  transition: none !important;
}

.hero[data-reduced='true'] *,
.hero[data-reduced='true'] *::before,
.hero[data-reduced='true'] *::after {
  animation: none !important;
}

@keyframes hero-q-out {
  to {
    opacity: 0;
    filter: blur(6px);
  }
}

@keyframes hero-glow-sweep {
  from {
    clip-path: inset(0 100% 0 0);
  }
  to {
    clip-path: inset(0 -20% 0 100%);
  }
}

@media (max-width: 1023px) {
  .hero-portrait {
    width: min(340px, 40vw);
  }
}

@media (max-width: 767px) {
  .hero {
    align-items: start;
  }

  .hero-portrait {
    right: -8vw;
    width: 62vw;
  }

  .hero-portrait[data-visible='true'] {
    opacity: 0.35;
  }
}
```

- [ ] **Step 7: Datos y textos**
  - `src/data/profile.js`: borrar las claves `roles` y `available` (ya no las usa nadie).
  - `src/data/data.test.js`: borrar la línea `expect(profile.roles.es.length).toBe(profile.roles.en.length)`.
  - `src/i18n/strings.js`: borrar `heroCtaProjects`, `heroCtaContact` y `scrollHint`; añadir:

```js
  heroCtaCases: { es: 'Ver casos', en: 'See case studies' },
```

```bash
git rm src/hooks/useTypewriter.js src/hooks/useTypewriter.test.js
```

- [ ] **Step 8: Tests, lint, build**

Run: `npm test && npm run lint && npm run build`
Expected: todo en verde.

- [ ] **Step 9: Comprobación visual (juicio)**

`npm run dev` a 1440, 1024, 768 y 375 px, con `?scene=high` y `?scene=static`:
  - Tras el preloader: pregunta 1 (monitor con la web maquetándose) → 2 (panel) → 3 (móvil encendido) → respuesta grande con un único barrido cian, la lista pequeña de preguntas encima, texto, prueba y CTAs; el retrato aparece a la derecha. Total ≈ 6–7 s.
  - Una rueda, un clic o una tecla saltan al final (con tecla, sin animación). Recargar en la misma pestaña empieza ya en el final.
  - Con "Reducir movimiento" del sistema (o DevTools → Rendering → `prefers-reduced-motion: reduce`): todo visible a la vez, sin desplazamientos.
  - El barrido coincide letra a letra con el titular (si se desalinea, ajustar solo `.w-mask` padding/margin). Contraste del texto sobre la escena legible en las cuatro anchuras; a 375 el retrato queda detrás, atenuado.

- [ ] **Step 10: Commit**

```bash
git add src/hooks/useHeroSequence.js src/hooks/useHeroSequence.test.js src/hooks/useSceneCue.js src/hooks/useSceneCue.test.js src/components/SplitWords.jsx src/components/SplitWords.test.jsx src/components/css/SplitWords.css src/components/Hero.jsx src/components/Hero.test.jsx src/components/css/Hero.css src/components/HeroPortrait.jsx src/data/profile.js src/data/data.test.js src/i18n/strings.js
git commit -m "Replace the hero with the question sequence driving the scene

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Servicios con pin ligado al scroll

> **Tipo:** integración con juicio visual (pin de GSAP, maquetación en dos columnas). Modelo capaz.

**Files:**
- Create: `src/components/Services.jsx`, `src/components/Services.test.jsx`, `src/components/css/Services.css`, `src/hooks/useMediaQuery.js`, `src/hooks/useMediaQuery.test.js`, `src/lib/progress.js`, `src/lib/progress.test.js`
- Modify: `src/routes/home.jsx`, `src/i18n/strings.js`

**Interfaces:**
- Consumes: `services` (Tarea 2), `getCase` (Tarea 2), `ScreenPreview` (Tarea 3), `SplitWords`, `useSceneCue` (Tarea 6), `SectionHeading`, `renderWithRouter`.
- Produces:
  - `stepForProgress(progress, count) → índice 0..count-1` en `src/lib/progress.js`.
  - `useMediaQuery(query) → boolean` (sin `window` en prerender: `false`).
  - `<Services reducedMotion />` con `id="servicios"`, `data-mode="pinned"|"stacked"`; en modo pin cada panel `.service-panel` lleva `data-active`.
  - Strings `servicesTitle`, `servicesProof`.

- [ ] **Step 1: Escribir los tests que fallan**

`src/lib/progress.test.js`:

```js
import { describe, expect, it } from 'vitest'
import { stepForProgress } from './progress'

describe('stepForProgress', () => {
  it('splits the pinned scroll into equal parts', () => {
    expect(stepForProgress(0, 3)).toBe(0)
    expect(stepForProgress(0.32, 3)).toBe(0)
    expect(stepForProgress(0.34, 3)).toBe(1)
    expect(stepForProgress(0.99, 3)).toBe(2)
  })

  it('stays inside the range at the edges', () => {
    expect(stepForProgress(1, 3)).toBe(2)
    expect(stepForProgress(-0.2, 3)).toBe(0)
    expect(stepForProgress(1.4, 3)).toBe(2)
  })
})
```

`src/hooks/useMediaQuery.test.js`:

```js
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { mockMatchMedia } from '../test/mocks'
import { useMediaQuery } from './useMediaQuery'

describe('useMediaQuery', () => {
  it('reads the query and follows its changes', () => {
    let narrow = true
    const media = mockMatchMedia((query) => query === '(max-width: 767px)' && narrow)
    const { result } = renderHook(() => useMediaQuery('(max-width: 767px)'))
    expect(result.current).toBe(true)
    narrow = false
    act(() => media.emit(false))
    expect(result.current).toBe(false)
  })
})
```

`src/components/Services.test.jsx`:

```jsx
import { act, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Services from './Services'
import { mockMatchMedia } from '../test/mocks'
import { renderWithRouter } from '../test/router'

const section = () => document.getElementById('servicios')

describe('Services', () => {
  it('stacks the three services, each with a preview, on small screens', () => {
    mockMatchMedia((query) => query === '(max-width: 767px)')
    renderWithRouter(<Services reducedMotion={false} />)
    expect(section()).toHaveAttribute('data-mode', 'stacked')
    expect(screen.getByRole('heading', { level: 2, name: 'Lo que puedo construir para ti' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
      'Tu web',
      'Tu herramienta',
      'Tu app',
    ])
    expect(screen.getAllByRole('img')).toHaveLength(3)
  })

  it('stacks too when motion is reduced', () => {
    renderWithRouter(<Services reducedMotion />)
    expect(section()).toHaveAttribute('data-mode', 'stacked')
  })

  it('links each service to its proof, except the web until the demo exists', () => {
    renderWithRouter(<Services reducedMotion />)
    expect(screen.getByRole('link', { name: /Prueba: SolarMetrics/ })).toHaveAttribute('href', '/casos/solarmetrics')
    expect(screen.getByRole('link', { name: /Prueba: Seenat/ })).toHaveAttribute('href', '/casos/seenat')
    expect(screen.getAllByRole('link')).toHaveLength(2)
  })

  it('keeps every service in the HTML while pinned and starts on the first one', () => {
    renderWithRouter(<Services reducedMotion={false} />)
    expect(section()).toHaveAttribute('data-mode', 'pinned')
    const panels = section().querySelectorAll('.service-panel')
    expect(panels).toHaveLength(3)
    expect(panels[0]).toHaveAttribute('data-active', 'true')
    expect(panels[1]).toHaveAttribute('data-active', 'false')
    expect(section()).toHaveTextContent('Si lo haces a mano cada semana, se puede automatizar.')
    expect(section()).toHaveTextContent('Paneles, áreas de cliente, gestión interna, informes, conexiones entre sistemas.')
  })

  it('shows the service whose link receives keyboard focus', () => {
    renderWithRouter(<Services reducedMotion={false} />)
    act(() => screen.getByRole('link', { name: /Prueba: Seenat/ }).focus())
    expect(section().querySelectorAll('.service-panel')[2]).toHaveAttribute('data-active', 'true')
  })
})
```

- [ ] **Step 2: Ejecutar y verlos fallar**

Run: `npx vitest run src/lib/progress.test.js src/hooks/useMediaQuery.test.js src/components/Services.test.jsx`
Expected: FAIL — módulos inexistentes.

- [ ] **Step 3: Utilidades**

`src/lib/progress.js`:

```js
export function stepForProgress(progress, count) {
  const clamped = Math.min(1, Math.max(0, progress))
  return Math.min(count - 1, Math.floor(clamped * count))
}
```

`src/hooks/useMediaQuery.js`:

```js
import { useCallback, useSyncExternalStore } from 'react'

export function useMediaQuery(query) {
  const subscribe = useCallback(
    (callback) => {
      const media = window.matchMedia(query)
      media.addEventListener('change', callback)
      return () => media.removeEventListener('change', callback)
    },
    [query],
  )
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )
}
```

Añadir a `src/i18n/strings.js`:

```js
  servicesTitle: { es: 'Lo que puedo construir para ti', en: 'What I can build for you' },
  servicesProof: { es: 'Prueba', en: 'Proof' },
```

- [ ] **Step 4: Componente** — `src/components/Services.jsx`. El pin se aplica a `.services-pin` (hijo estable), nunca a la raíz del componente, para que GSAP pueda envolverlo y deshacerlo sin romper a React:

```jsx
import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { FiArrowUpRight } from 'react-icons/fi'
import { services } from '../data/services'
import { getCase } from '../data/cases'
import { localize } from '../data/localize'
import { useLang, useT } from '../i18n/useLang'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useSceneCue } from '../hooks/useSceneCue'
import { ScrollTrigger, useGSAP } from '../lib/gsap'
import { stepForProgress } from '../lib/progress'
import SectionHeading from './SectionHeading'
import ScreenPreview from './ScreenPreview'
import SplitWords from './SplitWords'
import './css/Services.css'

function ServiceProof({ service }) {
  const t = useT()
  if (!service.caseSlug) return null
  const item = getCase(service.caseSlug)
  return (
    <Link className="service-proof" to={`/casos/${item.slug}`}>
      {t('servicesProof')}: {item.name}
      <FiArrowUpRight aria-hidden="true" />
    </Link>
  )
}

export default function Services({ reducedMotion }) {
  const lang = useLang()
  const t = useT()
  const pinRef = useRef(null)
  const narrow = useMediaQuery('(max-width: 767px)')
  const stacked = narrow || reducedMotion
  const [active, setActive] = useState(0)
  const [pinned, setPinned] = useState(false)

  useSceneCue(!stacked && pinned ? services[active].pose : null)

  useGSAP(
    () => {
      if (stacked) return
      ScrollTrigger.create({
        trigger: pinRef.current,
        start: 'top top',
        end: () => `+=${window.innerHeight * (services.length - 1)}`,
        pin: true,
        onUpdate: (self) => setActive(stepForProgress(self.progress, services.length)),
        onToggle: (self) => setPinned(self.isActive),
      })
    },
    { scope: pinRef, dependencies: [stacked] },
  )

  return (
    <section
      id="servicios"
      className="section services"
      data-mode={stacked ? 'stacked' : 'pinned'}
      aria-labelledby="servicios-title"
    >
      <div className="services-pin" ref={pinRef}>
        <div className="container services-inner">
          <SectionHeading id="servicios-title" eyebrow="01" title={t('servicesTitle')} />
          {stacked ? (
            <ol className="services-list">
              {services.map((service) => (
                <li key={service.id} className="card service-block">
                  <p className="services-number mono" aria-hidden="true">
                    {service.number}
                  </p>
                  <h3>{localize(service.title, lang)}</h3>
                  <p className="service-message">{localize(service.message, lang)}</p>
                  <p className="service-includes">{localize(service.includes, lang)}</p>
                  <ServiceProof service={service} />
                  <ScreenPreview screen={service.screen} reducedMotion={reducedMotion} />
                </li>
              ))}
            </ol>
          ) : (
            <div className="services-stage">
              <ol className="services-panels">
                {services.map((service, index) => (
                  <li
                    key={service.id}
                    className="service-panel"
                    data-active={index === active ? 'true' : 'false'}
                    onFocus={() => setActive(index)}
                  >
                    <div className="service-copy">
                      <p className="services-number" aria-hidden="true">
                        <span className="services-number-digits">{service.number}</span>
                      </p>
                      <h3>{localize(service.title, lang)}</h3>
                      <p className="service-message">
                        <SplitWords text={localize(service.message, lang)} mask />
                      </p>
                      <p className="service-includes">{localize(service.includes, lang)}</p>
                      <ServiceProof service={service} />
                    </div>
                    <figure className="service-figure">
                      <ScreenPreview screen={service.screen} reducedMotion={reducedMotion} />
                    </figure>
                  </li>
                ))}
              </ol>
              <div className="services-progress" aria-hidden="true">
                <span className="services-progress-track">
                  <span
                    className="services-progress-bar"
                    style={{ transform: `scaleX(${(active + 1) / services.length})` }}
                  />
                </span>
                <span className="services-progress-count mono">
                  {active + 1}/{services.length}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Estilos** — `src/components/css/Services.css`:

```css
.services[data-mode='pinned'] {
  padding-block: 0;
}

.services[data-mode='pinned'] .services-pin {
  display: flex;
  align-items: center;
  min-height: 100svh;
  padding-block: calc(var(--nav-h) + 1rem) 2rem;
}

.services-inner {
  width: min(100% - 32px, var(--container));
}

.services-panels {
  display: grid;
}

.service-panel {
  grid-area: 1 / 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  column-gap: clamp(2rem, 5vw, 4rem);
  align-items: center;
  transition:
    opacity var(--dur-ui) var(--ease-out),
    transform var(--dur-ui) var(--ease-out);
}

.service-panel[data-active='false'] {
  opacity: 0;
  transform: translateY(16px);
  pointer-events: none;
}

.service-copy {
  display: grid;
  gap: 0.9rem;
  justify-items: start;
}

.services-number {
  overflow: hidden;
  color: var(--accent);
  font: 600 clamp(3.5rem, 8vw, 6rem) / 1 var(--font-display);
  text-shadow: 0 0 24px rgba(0, 229, 255, 0.35);
}

.services-number-digits {
  display: inline-block;
}

.service-panel[data-active='true'] .services-number-digits {
  animation: services-count 420ms var(--ease-out) both;
}

.service-panel h3,
.service-block h3 {
  font-size: clamp(1.4rem, 2.4vw, 1.9rem);
}

.service-message {
  max-width: 24ch;
  font: 600 clamp(1.5rem, 3vw, 2.4rem) / 1.15 var(--font-display);
}

.service-panel[data-active='true'] .w-inner {
  animation: word-in 500ms var(--ease-out) both;
  animation-delay: calc(80ms + var(--i) * 30ms);
}

.service-includes {
  max-width: 46ch;
  color: var(--text-muted);
}

.service-proof {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 44px;
  color: var(--accent);
  font-weight: 600;
}

/* The 3D scene shows the piece on the right; the HTML preview only fills in on the static tier. */
.service-figure {
  display: none;
  margin: 0;
}

html[data-scene='static'] .service-figure {
  display: block;
}

.services-progress {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  max-width: 320px;
}

.services-progress-track {
  flex: 1;
  height: 2px;
  background: var(--border);
  overflow: hidden;
}

.services-progress-bar {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.6);
  transform-origin: left;
  transition: transform var(--dur-ui) var(--ease-out);
}

.services-progress-count {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.services-list {
  display: grid;
  gap: 1.25rem;
}

.service-block {
  display: grid;
  gap: 0.75rem;
  justify-items: start;
  padding: 1.5rem;
}

.service-block .services-number {
  font-size: 2.5rem;
}

.service-block .service-message {
  font-size: clamp(1.25rem, 5vw, 1.6rem);
}

@keyframes services-count {
  from {
    opacity: 0;
    transform: translateY(100%);
  }
}

@media (max-width: 1023px) {
  .service-panel {
    grid-template-columns: minmax(0, 1fr);
  }
}
```

- [ ] **Step 6: Montarlo en la home** — en `src/routes/home.jsx` importar `import Services from '../components/Services'` y renderizar `<Services reducedMotion={reducedMotion} />` justo después de `<Hero ... />`.

- [ ] **Step 7: Tests, lint, build**

Run: `npm test && npm run lint && npm run build`
Expected: todo en verde.

- [ ] **Step 8: Comprobación visual (juicio)**

`npm run dev`, `?scene=high` a 1440 y 1024: al llegar a Servicios la sección se fija; con el scroll pasan 01 → 02 → 03 (el número sube como un contador, el mensaje entra por palabras, la barra avanza 1/3 → 3/3) y la cámara enfoca monitor con web, monitor con panel y móvil; al salir del pin la cámara vuelve a seguir las secciones. Con `?scene=static` aparece la vista previa HTML a la derecha. A 375 px y con reduced motion: tres bloques apilados con su imagen, sin pin. Tabulando hasta "Prueba: Seenat" el panel 03 se muestra.

- [ ] **Step 9: Commit**

```bash
git add src/components/Services.jsx src/components/Services.test.jsx src/components/css/Services.css src/hooks/useMediaQuery.js src/hooks/useMediaQuery.test.js src/lib/progress.js src/lib/progress.test.js src/routes/home.jsx src/i18n/strings.js
git commit -m "Add the pinned services section with stacked fallback

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---
### Task 8: Casos en la home (sustituye a Proyectos)

> **Tipo:** transcripción con comprobación visual ligera. Modelo económico.

**Files:**
- Create: `src/components/Cases.jsx`, `src/components/Cases.test.jsx`, `src/components/css/Cases.css`, `src/components/TechList.jsx`
- Modify: `src/routes/home.jsx`, `src/data/data.test.js`, `src/i18n/strings.js`
- Delete: `src/components/Projects.jsx`, `src/components/Projects.test.jsx`, `src/components/css/Projects.css`, `src/data/projects.js`

**Interfaces:**
- Consumes: `cases` (Tarea 2), `TECH`, `Reveal`, `SectionHeading`, `renderWithRouter`.
- Produces:
  - `<TechList ids: string[] label: string />` → `<ul class="tech-list" aria-label>` de chips con icono.
  - `<Cases />` con `id="casos"`; cada tarjeta lleva en su cabecera `style.viewTransitionName = 'case-<slug>'` (la Tarea 15 pone el mismo nombre en la cabecera del caso) y un `<Link viewTransition>` a `/casos/<slug>`.
  - Strings `casesTitle`, `caseCta`, `caseStack`.

- [ ] **Step 1: Escribir el test que falla** — `src/components/Cases.test.jsx`:

```jsx
import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Cases from './Cases'
import { renderWithRouter } from '../test/router'

describe('Cases', () => {
  it('shows one card per case with an honest label and a link to the case study', () => {
    renderWithRouter(<Cases />)
    expect(screen.getByRole('heading', { level: 2, name: 'Casos' })).toBeInTheDocument()
    const cards = screen.getAllByRole('article')
    expect(cards).toHaveLength(2)
    expect(within(cards[0]).getByText('Herramienta a medida · Proyecto de fin de grado')).toBeInTheDocument()
    expect(within(cards[1]).getByText('App móvil · En desarrollo')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Ver el caso.*SolarMetrics/ })).toHaveAttribute('href', '/casos/solarmetrics')
    expect(screen.getByRole('link', { name: /Ver el caso.*Seenat/ })).toHaveAttribute('href', '/casos/seenat')
  })

  it('only shows real figures', () => {
    renderWithRouter(<Cases />)
    const [solarmetrics, seenat] = screen.getAllByRole('article')
    expect(within(solarmetrics).getByText('API propia que simula una instalación fotovoltaica en tiempo real')).toBeInTheDocument()
    expect(within(seenat).getByText('163')).toBeInTheDocument()
    expect(within(seenat).getByText('pruebas automáticas en el backend')).toBeInTheDocument()
    expect(within(seenat).getByText('coordenadas guardadas')).toBeInTheDocument()
  })

  it('lists the technologies of each case', () => {
    renderWithRouter(<Cases />)
    const [solarmetrics, seenat] = screen.getAllByRole('list', { name: 'Tecnologías' })
    expect(within(solarmetrics).getAllByRole('listitem')).toHaveLength(7)
    expect(within(seenat).getByText('Flutter')).toBeInTheDocument()
  })

  it('names the card header for the shared transition to the case page', () => {
    renderWithRouter(<Cases />)
    const header = screen.getByRole('heading', { level: 3, name: 'Seenat' }).closest('header')
    expect(header.style.viewTransitionName).toBe('case-seenat')
  })
})
```

- [ ] **Step 2: Ejecutar y verlo fallar**

Run: `npx vitest run src/components/Cases.test.jsx`
Expected: FAIL — `Failed to resolve import "./Cases"`.

- [ ] **Step 3: Componentes**

Añadir a `src/i18n/strings.js` (y borrar `projectsTitle`, `projectProblem`, `projectSolution`, `projectStack`, `projectLive`, `projectCode`):

```js
  casesTitle: { es: 'Casos', en: 'Case studies' },
  caseCta: { es: 'Ver el caso', en: 'Read the case study' },
  caseStack: { es: 'Tecnologías', en: 'Technologies' },
```

`src/components/TechList.jsx`:

```jsx
import { TECH } from '../data/skills'

export default function TechList({ ids, label }) {
  return (
    <ul className="tech-list" aria-label={label}>
      {ids.map((id) => {
        const tech = TECH[id]
        return (
          <li key={id} className="chip">
            <tech.Icon aria-hidden="true" style={{ color: tech.color }} />
            {tech.name}
          </li>
        )
      })}
    </ul>
  )
}
```

`src/components/Cases.jsx`:

```jsx
import { Link } from 'react-router'
import { FiArrowRight } from 'react-icons/fi'
import { cases } from '../data/cases'
import { localize } from '../data/localize'
import { useLang, useT } from '../i18n/useLang'
import Reveal from './Reveal'
import SectionHeading from './SectionHeading'
import TechList from './TechList'
import './css/Cases.css'

export default function Cases() {
  const lang = useLang()
  const t = useT()

  return (
    <section id="casos" className="section cases" aria-labelledby="casos-title">
      <div className="container">
        <SectionHeading id="casos-title" eyebrow="02" title={t('casesTitle')} />
        <Reveal as="ul" className="cases-grid">
          {cases.map((item) => (
            <li key={item.slug}>
              <article className="card case-card" data-tilt aria-labelledby={`case-${item.slug}-title`}>
                <header className="case-card-head" style={{ viewTransitionName: `case-${item.slug}` }}>
                  <p className="case-label mono">{localize(item.label, lang)}</p>
                  <h3 id={`case-${item.slug}-title`}>{item.name}</h3>
                </header>
                <p className="case-tagline">{localize(item.tagline, lang)}</p>
                {item.highlight && <p className="case-highlight">{localize(item.highlight, lang)}</p>}
                {item.stats.length > 0 && (
                  <ul className="case-stats">
                    {item.stats.map((stat) => (
                      <li key={stat.id}>
                        <span className="case-stat-value">{stat.value}</span>{' '}
                        <span className="case-stat-label">{localize(stat.label, lang)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <TechList ids={item.stack} label={t('caseStack')} />
                <Link className="case-link" to={`/casos/${item.slug}`} viewTransition>
                  {t('caseCta')}
                  <span className="sr-only"> · {item.name}</span>
                  <FiArrowRight aria-hidden="true" />
                </Link>
              </article>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
```

`src/components/css/Cases.css`:

```css
.cases-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
}

.case-card {
  position: relative;
  display: grid;
  align-content: start;
  gap: 1rem;
  height: 100%;
  padding: clamp(1.5rem, 3vw, 2.25rem);
}

.case-label {
  color: var(--accent);
  font-size: 0.8rem;
}

.case-card-head h3 {
  margin-top: 0.35rem;
  font-size: clamp(1.8rem, 3.4vw, 2.6rem);
}

.case-tagline {
  font-size: 1.1rem;
}

.case-highlight {
  padding-left: 0.9rem;
  border-left: 2px solid var(--accent-2);
  color: var(--text-muted);
}

.case-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 2rem;
}

.case-stats li {
  display: grid;
}

.case-stat-value {
  color: var(--accent);
  font: 600 clamp(2rem, 4vw, 2.8rem) / 1 var(--font-display);
  text-shadow: 0 0 18px rgba(0, 229, 255, 0.35);
}

.case-stat-label {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.tech-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.case-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  justify-self: start;
  min-height: 44px;
  color: var(--accent);
  font-weight: 600;
}

/* The whole card is clickable through the link. */
.case-link::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
}

.case-card:active {
  transform: scale(0.99);
}

@media (max-width: 899px) {
  .cases-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
```

- [ ] **Step 4: Home y limpieza**
  - `src/routes/home.jsx`: quitar el import y el uso de `Projects`; importar `Cases` y renderizar `<Cases />` justo después de `<Services ... />`.
  - `src/data/data.test.js`: borrar `import { projects } from './projects'`, borrar el bucle `for (const project of projects) { ... }` del test `'has every translatable field in es and en'` y cambiar en `'only references known technologies'` la línea `const used = ...` por `const used = skillCategories.flatMap((c) => c.items)`.

```bash
git rm src/components/Projects.jsx src/components/Projects.test.jsx src/components/css/Projects.css src/data/projects.js
```

- [ ] **Step 5: Tests, lint, build**

Run: `npm test && npm run lint && npm run build`
Expected: todo en verde.

- [ ] **Step 6: Comprobación visual**

`npm run dev`: a 1440 dos tarjetas lado a lado; a 375 una columna. Toda la tarjeta es pulsable (lleva a `/casos/<slug>`, que hasta la Tarea 15 es la 404). Las cifras de Seenat destacan en cian; SolarMetrics muestra su frase protagonista, sin números.

- [ ] **Step 7: Commit**

```bash
git add src/components/Cases.jsx src/components/Cases.test.jsx src/components/css/Cases.css src/components/TechList.jsx src/routes/home.jsx src/data/data.test.js src/i18n/strings.js
git commit -m "Replace the projects section with case cards

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Cómo trabajo — línea neón ligada al scroll

> **Tipo:** transcripción con juicio visual ligero (sincronía línea/pasos). Modelo económico.

**Files:**
- Create: `src/components/Process.jsx`, `src/components/Process.test.jsx`, `src/components/css/Process.css`
- Modify: `src/routes/home.jsx`, `src/i18n/strings.js`

**Interfaces:**
- Consumes: `processSteps` (Tarea 2), `gsap`, `ScrollTrigger`, `useGSAP`, `SectionHeading`.
- Produces: `<Process reducedMotion />` con `id="proceso"`; `data-armed="true"` cuando los disparadores de scroll están activos (solo entonces se ocultan los textos aún no alcanzados: sin JS o con reduced motion todo se ve); cada `.process-step` lleva `data-lit`. String `processTitle`.

- [ ] **Step 1: Escribir el test que falla** — `src/components/Process.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Process from './Process'

describe('Process', () => {
  it('lists the four steps in order with their promises', () => {
    render(<Process reducedMotion />)
    expect(screen.getByRole('heading', { level: 2, name: 'Cómo trabajo' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
      'Me cuentas tu idea',
      'Propuesta por escrito',
      'Lo construimos juntos',
      'Lanzamiento y después',
    ])
    expect(screen.getByText(/te respondo en menos de 48 h\./)).toBeInTheDocument()
    expect(screen.getByText(/30 días de soporte incluidos tras el lanzamiento\./)).toBeInTheDocument()
  })

  it('shows the whole line and every step at once with reduced motion', () => {
    const { container } = render(<Process reducedMotion />)
    const steps = container.querySelectorAll('.process-step')
    expect([...steps].every((step) => step.dataset.lit === 'true')).toBe(true)
    expect(container.querySelector('#proceso')).not.toHaveAttribute('data-armed', 'true')
  })
})
```

- [ ] **Step 2: Ejecutar y verlo fallar**

Run: `npx vitest run src/components/Process.test.jsx`
Expected: FAIL — `Failed to resolve import "./Process"`.

- [ ] **Step 3: Componente y estilos**

Añadir a `src/i18n/strings.js`:

```js
  processTitle: { es: 'Cómo trabajo', en: 'How I work' },
```

`src/components/Process.jsx`:

```jsx
import { useRef, useState } from 'react'
import { processSteps } from '../data/process'
import { localize } from '../data/localize'
import { useLang, useT } from '../i18n/useLang'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'
import SectionHeading from './SectionHeading'
import './css/Process.css'

export default function Process({ reducedMotion }) {
  const lang = useLang()
  const t = useT()
  const ref = useRef(null)
  const [lit, setLit] = useState(0)
  const [armed, setArmed] = useState(false)
  const shown = reducedMotion ? processSteps.length : lit

  useGSAP(
    () => {
      if (reducedMotion) {
        setArmed(false)
        return
      }
      gsap.fromTo(
        '.process-line-fill',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: '.process-steps', start: 'top 70%', end: 'bottom 70%', scrub: true },
        },
      )
      gsap.utils.toArray('.process-step', ref.current).forEach((step, index) => {
        ScrollTrigger.create({
          trigger: step,
          start: 'top 70%',
          onEnter: () => setLit((current) => Math.max(current, index + 1)),
          onLeaveBack: () => setLit(index),
        })
      })
      setArmed(true)
    },
    { scope: ref, dependencies: [reducedMotion] },
  )

  return (
    <section
      id="proceso"
      ref={ref}
      className="section process"
      data-armed={armed && !reducedMotion ? 'true' : undefined}
      aria-labelledby="proceso-title"
    >
      <div className="container">
        <SectionHeading id="proceso-title" eyebrow="03" title={t('processTitle')} />
        <div className="process-track">
          <span className="process-line" aria-hidden="true">
            <span className="process-line-fill" />
          </span>
          <ol className="process-steps">
            {processSteps.map((step, index) => (
              <li key={step.id} className="process-step" data-lit={index < shown ? 'true' : 'false'}>
                <span className="process-number mono" aria-hidden="true">
                  {step.number}
                </span>
                <div className="process-text">
                  <h3>{localize(step.title, lang)}</h3>
                  <p>{localize(step.detail, lang)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
```

`src/components/css/Process.css`:

```css
.process-track {
  position: relative;
  max-width: 760px;
}

.process-line {
  position: absolute;
  top: 0.5rem;
  bottom: 0.5rem;
  left: 1.6rem;
  width: 2px;
  background: var(--border);
}

.process-line-fill {
  display: block;
  height: 100%;
  background: linear-gradient(180deg, var(--accent), var(--accent-2));
  box-shadow: 0 0 12px rgba(0, 229, 255, 0.6);
  transform-origin: top;
}

.process-steps {
  display: grid;
  gap: clamp(2rem, 6vh, 3.5rem);
}

.process-step {
  position: relative;
  display: grid;
  grid-template-columns: 3.2rem minmax(0, 1fr);
  gap: 1.25rem;
  align-items: start;
}

.process-number {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 3.2rem;
  height: 3.2rem;
  border: 1px solid var(--border-strong);
  border-radius: 50%;
  background: var(--bg);
  color: var(--text-muted);
  transition:
    color var(--dur-ui) var(--ease-out),
    border-color var(--dur-ui) var(--ease-out),
    box-shadow var(--dur-ui) var(--ease-out);
}

.process-step[data-lit='true'] .process-number {
  border-color: var(--accent);
  color: var(--accent);
  box-shadow: 0 0 18px rgba(0, 229, 255, 0.45);
}

.process-text h3 {
  margin-bottom: 0.4rem;
  font-size: clamp(1.3rem, 2.4vw, 1.7rem);
}

.process-text p {
  max-width: 52ch;
  color: var(--text-muted);
}

.process-text {
  transition:
    opacity var(--dur-ui) var(--ease-out) 80ms,
    transform var(--dur-ui) var(--ease-out) 80ms;
}

/* Only hidden once the scroll triggers exist: without JS or with reduced motion everything is visible. */
.process[data-armed='true'] .process-step[data-lit='false'] .process-text {
  opacity: 0;
  transform: translateY(10px);
}
```

Montar en `src/routes/home.jsx`: importar `Process` y renderizar `<Process reducedMotion={reducedMotion} />` justo después de `<Cases />`.

- [ ] **Step 4: Tests, lint, build**

Run: `npm test && npm run lint && npm run build`
Expected: todo en verde.

- [ ] **Step 5: Comprobación visual**

`npm run dev`, 1440: la línea neón se dibuja con el scroll, cada número se enciende cuando la línea llega y su texto aparece justo después; la escena se atenúa (pose `process`). Con reduced motion: línea completa y todo visible.

- [ ] **Step 6: Commit**

```bash
git add src/components/Process.jsx src/components/Process.test.jsx src/components/css/Process.css src/routes/home.jsx src/i18n/strings.js
git commit -m "Add the how-I-work section with a scroll-drawn neon line

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Quién soy y Ahora mismo (sustituyen a Sobre mí, Experiencia y Educación)

> **Tipo:** integración con juicio visual (lectura ligada al scroll, trayectoria). Modelo capaz.

**Files:**
- Create: `src/components/WhoAmI.jsx`, `src/components/WhoAmI.test.jsx`, `src/components/css/WhoAmI.css`, `src/components/Now.jsx`, `src/components/Now.test.jsx`, `src/components/css/Now.css`, `src/components/css/TechMarquee.css`
- Modify: `src/components/TechMarquee.jsx`, `src/lib/format.js`, `src/lib/format.test.js`, `src/routes/home.jsx`, `src/data/profile.js`, `src/data/skills.js`, `src/data/data.test.js`, `src/i18n/strings.js`
- Delete: `src/components/About.jsx`, `src/components/About.test.jsx`, `src/components/css/About.css`, `src/components/Experience.jsx`, `src/components/Experience.test.jsx`, `src/components/css/Experience.css`, `src/components/Education.jsx`, `src/components/Education.test.jsx`, `src/components/css/Education.css`, `src/components/CountUp.jsx`, `src/components/CountUp.test.jsx`, `src/data/education.js`

**Interfaces:**
- Consumes: `profile.about`, `experience`, `JOURNEY_IDS`, `now` (Tarea 2), `SplitWords` (Tarea 6), `TechMarquee`, `Reveal`, `SectionHeading`.
- Produces:
  - `formatMonthYear(isoDate, lang) → 'octubre 2026' | 'October 2026'`, `formatDate(isoDate, lang) → '27 de septiembre de 2026' | '27 September 2026'`, `fill(template, values) → string` (sustituye `{clave}`) en `src/lib/format.js`.
  - `<WhoAmI reducedMotion />` (`id="quien-soy"`), `<Now />` (`id="ahora"`).
  - Strings `whoTitle`, `whoJourney`, `whoStackTitle`, `nowTitle`, `nowUpdated`.

- [ ] **Step 1: Escribir los tests que fallan**

Añadir a `src/lib/format.test.js`:

```js
import { fill, formatDate, formatMonthYear } from './format'

describe('dates', () => {
  it('shows month and year without the "de" connector', () => {
    expect(formatMonthYear('2026-10-01', 'es')).toBe('octubre 2026')
    expect(formatMonthYear('2026-10-01', 'en')).toBe('October 2026')
  })

  it('shows full dates in each language, without timezone drift', () => {
    expect(formatDate('2026-09-27', 'es')).toBe('27 de septiembre de 2026')
    expect(formatDate('2026-09-27', 'en')).toBe('27 September 2026')
  })
})

describe('fill', () => {
  it('replaces named placeholders and leaves unknown ones alone', () => {
    expect(fill('Paso {current} de {total}', { current: 2, total: 4 })).toBe('Paso 2 de 4')
    expect(fill('Hola {name} {x}', { name: 'Ana' })).toBe('Hola Ana {x}')
  })
})
```

(Juntar este `import` con el existente de `./format` en una sola línea.)

`src/components/WhoAmI.test.jsx`:

```jsx
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import WhoAmI from './WhoAmI'

describe('WhoAmI', () => {
  it('opens with the hook and tells the story', () => {
    render(<WhoAmI reducedMotion />)
    expect(screen.getByRole('heading', { level: 2, name: 'Quién soy' })).toBeInTheDocument()
    expect(screen.getByText('Empecé arreglando ordenadores. Ahora construyo el software que funciona en ellos.')).toBeInTheDocument()
    expect(document.querySelector('.whoami-text')).toHaveTextContent(
      'Pasé por soporte técnico, después por ERP con Odoo y hoy desarrollo herramientas web en Macrosad.',
    )
    expect(screen.getByText('Doble titulación ASIR + DAM · nota media 9,7')).toBeInTheDocument()
  })

  it('walks through the four jobs in order, with role and dates on demand', () => {
    render(<WhoAmI reducedMotion />)
    const stops = screen.getAllByRole('button')
    expect(stops.map((stop) => stop.textContent)).toEqual(['Mecaofi', 'Grupo Avanza', 'Intelec', 'Macrosad'])
    fireEvent.click(stops[2])
    expect(stops[2]).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Desarrollador Full Stack y Odoo')).toBeInTheDocument()
    expect(screen.getByText('Marzo – Junio 2024')).toBeInTheDocument()
    expect(screen.getByText('Actual')).toBeInTheDocument()
    fireEvent.click(stops[2])
    expect(stops[2]).toHaveAttribute('aria-expanded', 'false')
  })

  it('lights the whole journey at once with reduced motion', () => {
    render(<WhoAmI reducedMotion />)
    expect(document.querySelector('.journey')).toHaveAttribute('data-lit', 'true')
  })
})
```

`src/components/Now.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Now from './Now'

describe('Now', () => {
  it('says what I am up to and when it was updated', () => {
    render(<Now />)
    expect(screen.getByRole('heading', { level: 2, name: 'Ahora mismo' })).toBeInTheDocument()
    expect(screen.getByText('octubre 2026')).toHaveAttribute('datetime', '2026-10-01')
    expect(screen.getByText('Construyendo:')).toBeInTheDocument()
    expect(screen.getByText(/herramientas internas en mi trabajo y Seenat, mi app en Flutter\./)).toBeInTheDocument()
    expect(screen.getByText(/los problemas difíciles; ahí es donde más aprendo\./)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Ejecutar y verlos fallar**

Run: `npx vitest run src/lib/format.test.js src/components/WhoAmI.test.jsx src/components/Now.test.jsx`
Expected: FAIL — `fill`/`formatDate`/`formatMonthYear` no existen y faltan los componentes.

- [ ] **Step 3: Formato** — añadir a `src/lib/format.js`:

```js
const toDate = (iso) => new Date(`${iso}T00:00:00Z`)

export function formatMonthYear(iso, lang = 'es') {
  const date = toDate(iso)
  const month = new Intl.DateTimeFormat(LOCALES[lang] ?? LOCALES.es, { month: 'long', timeZone: 'UTC' }).format(date)
  return `${month} ${date.getUTCFullYear()}`
}

export function formatDate(iso, lang = 'es') {
  return new Intl.DateTimeFormat(LOCALES[lang] ?? LOCALES.es, { dateStyle: 'long', timeZone: 'UTC' }).format(toDate(iso))
}

export function fill(template, values) {
  return template.replace(/\{(\w+)\}/g, (match, key) => (key in values ? String(values[key]) : match))
}
```

- [ ] **Step 4: Componentes**

Añadir a `src/i18n/strings.js` (y borrar `aboutTitle`, `aboutHello`, `aboutNow`, `aboutBasedIn`, `aboutStack`, `experienceTitle`, `educationTitle`):

```js
  whoTitle: { es: 'Quién soy', en: 'About me' },
  whoJourney: { es: 'Trayectoria', en: 'Career path' },
  whoStackTitle: { es: 'Con qué trabajo', en: 'What I work with' },
  nowTitle: { es: 'Ahora mismo', en: 'Right now' },
  nowUpdated: { es: 'actualizado', en: 'updated' },
```

`src/components/WhoAmI.jsx`:

```jsx
import { useRef, useState } from 'react'
import { profile } from '../data/profile'
import { experience, JOURNEY_IDS } from '../data/experience'
import { localize } from '../data/localize'
import { useLang, useT } from '../i18n/useLang'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'
import SectionHeading from './SectionHeading'
import SplitWords from './SplitWords'
import TechMarquee from './TechMarquee'
import './css/WhoAmI.css'

const JOURNEY = JOURNEY_IDS.map((id) => experience.find((job) => job.id === id))

export default function WhoAmI({ reducedMotion }) {
  const lang = useLang()
  const t = useT()
  const ref = useRef(null)
  const [journeyLit, setJourneyLit] = useState(false)
  const [open, setOpen] = useState(null)

  useGSAP(
    () => {
      if (reducedMotion) return
      // The text "reads itself": each word goes from 0.15 to full opacity with the scroll.
      gsap.fromTo(
        '.whoami-text .w',
        { opacity: 0.15 },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.05,
          scrollTrigger: { trigger: '.whoami-text', start: 'top 80%', end: 'bottom 50%', scrub: true },
        },
      )
      ScrollTrigger.create({ trigger: '.journey', start: 'top 80%', once: true, onEnter: () => setJourneyLit(true) })
    },
    { scope: ref, dependencies: [reducedMotion] },
  )

  return (
    <section id="quien-soy" ref={ref} className="section whoami" aria-labelledby="quien-soy-title">
      <div className="container">
        <SectionHeading id="quien-soy-title" eyebrow="04" title={t('whoTitle')} />
        <p className="whoami-hook">{localize(profile.about.hook, lang)}</p>
        <p className="whoami-text">
          <SplitWords text={localize(profile.about.text, lang)} />
        </p>

        <h3 className="whoami-subtitle">{t('whoJourney')}</h3>
        <ol className="journey" data-lit={reducedMotion || journeyLit ? 'true' : 'false'}>
          {JOURNEY.map((job, index) => (
            <li key={job.id} className="journey-stop" style={{ '--i': index }}>
              <button
                type="button"
                className="journey-button"
                aria-expanded={open === job.id}
                onClick={() => setOpen((current) => (current === job.id ? null : job.id))}
              >
                <span className="journey-dot" aria-hidden="true" />
                <span className="journey-name">{job.shortName}</span>
              </button>
              <p className="journey-detail">
                <span>{localize(job.role, lang)}</span>
                <span className="mono">{localize(job.period, lang)}</span>
                {job.end === null && <span className="chip chip-live">{t('current')}</span>}
              </p>
            </li>
          ))}
        </ol>

        <p className="whoami-education">{localize(profile.about.education, lang)}</p>
        <h3 className="whoami-subtitle">{t('whoStackTitle')}</h3>
      </div>
      <TechMarquee />
    </section>
  )
}
```

Nota: el `<span className="journey-name">` es el único texto del botón (el punto es `aria-hidden` y vacío), así que el nombre accesible es solo el de la empresa; el puesto y las fechas siguen en el DOM para lectores de pantalla.

`src/components/css/WhoAmI.css`:

```css
.whoami-hook {
  max-width: 22ch;
  margin-bottom: 1.5rem;
  font: 600 clamp(1.8rem, 4vw, 3rem) / 1.1 var(--font-display);
}

.whoami-text {
  max-width: 62ch;
  font-size: clamp(1.05rem, 1.6vw, 1.3rem);
  line-height: 1.7;
}

.whoami-subtitle {
  margin-block: clamp(2.5rem, 7vh, 4rem) 1.25rem;
  color: var(--text-muted);
  font: 500 0.85rem var(--font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.journey {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.journey::before {
  content: '';
  position: absolute;
  top: 1.35rem;
  left: 0.5rem;
  right: 0.5rem;
  height: 1px;
  background: var(--border-strong);
}

.journey-stop {
  position: relative;
  display: grid;
  gap: 0.5rem;
  justify-items: start;
}

.journey-button {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.6rem;
  min-height: 44px;
  padding: 0.6rem 0;
  border: 0;
  background: none;
  color: var(--text);
  font: 600 1rem var(--font-body);
  cursor: pointer;
  transition: transform var(--dur-press) var(--ease-out);
}

.journey-button:active {
  transform: scale(0.97);
}

.journey-dot {
  width: 14px;
  height: 14px;
  border: 1px solid var(--border-strong);
  border-radius: 50%;
  background: var(--surface-2);
  transition:
    background-color var(--dur-ui) var(--ease-out) calc(var(--i) * 60ms),
    box-shadow var(--dur-ui) var(--ease-out) calc(var(--i) * 60ms),
    border-color var(--dur-ui) var(--ease-out) calc(var(--i) * 60ms);
}

.journey[data-lit='true'] .journey-dot {
  border-color: var(--accent);
  background: var(--accent);
  box-shadow: 0 0 14px rgba(0, 229, 255, 0.6);
}

.journey-detail {
  display: grid;
  gap: 0.2rem;
  color: var(--text-muted);
  font-size: 0.88rem;
  opacity: 0;
  transform: translateY(6px);
  transition:
    opacity var(--dur-ui) var(--ease-out),
    transform var(--dur-ui) var(--ease-out);
}

.journey-detail .chip {
  justify-self: start;
  margin-top: 0.3rem;
}

.journey-stop:focus-within .journey-detail,
.journey-button[aria-expanded='true'] + .journey-detail {
  opacity: 1;
  transform: none;
}

@media (hover: hover) and (pointer: fine) {
  .journey-stop:hover .journey-detail {
    opacity: 1;
    transform: none;
  }
}

.whoami-education {
  margin-top: 2rem;
  color: var(--text-muted);
}

@media (max-width: 767px) {
  .journey {
    grid-template-columns: minmax(0, 1fr);
  }

  .journey::before {
    top: 0.5rem;
    bottom: 0.5rem;
    left: 6px;
    right: auto;
    width: 1px;
    height: auto;
  }

  .journey-detail {
    opacity: 1;
    transform: none;
    padding-left: 1.75rem;
  }
}
```

`src/components/Now.jsx`:

```jsx
import { now } from '../data/now'
import { localize } from '../data/localize'
import { useLang, useT } from '../i18n/useLang'
import { formatMonthYear } from '../lib/format'
import Reveal from './Reveal'
import './css/Now.css'

export default function Now() {
  const lang = useLang()
  const t = useT()

  return (
    <section id="ahora" className="section now" aria-labelledby="ahora-title">
      <div className="container">
        <Reveal className="card now-card">
          <header className="now-head">
            <h2 id="ahora-title">{t('nowTitle')}</h2>
            <p className="now-updated mono">
              {t('nowUpdated')} <time dateTime={now.updated}>{formatMonthYear(now.updated, lang)}</time>
            </p>
          </header>
          <ul className="now-list">
            {now.items.map((item) => (
              <li key={item.id}>
                <strong>{localize(item.label, lang)}</strong> {localize(item.text, lang)}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
```

`src/components/css/Now.css`:

```css
.now {
  padding-block: clamp(3rem, 8vh, 5rem);
}

.now-card {
  display: grid;
  gap: 1.25rem;
  max-width: 720px;
  padding: clamp(1.5rem, 3vw, 2.25rem);
}

.now-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5rem 1rem;
}

.now-head h2 {
  font-size: clamp(1.5rem, 3vw, 2rem);
}

.now-updated {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.now-list {
  display: grid;
  gap: 0.6rem;
}

.now-list strong {
  color: var(--accent);
  font-weight: 600;
}
```

`src/components/css/TechMarquee.css`: mover aquí, sin cambios, todas las reglas de marquesina de `About.css` (`.marquee`, `.marquee-track`, `.marquee:hover .marquee-track`, `.marquee-item`, `@keyframes marquee` y el bloque `@media (prefers-reduced-motion: reduce)` con `.marquee-track`, `.marquee-item` y `.marquee-item[data-duplicate]`), cambiando solo la pausa en hover para que respete el puntero fino:

```css
.marquee {
  margin-top: 1rem;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
}

.marquee-track {
  display: flex;
  width: max-content;
  animation: marquee 40s linear infinite;
}

@media (hover: hover) and (pointer: fine) {
  .marquee:hover .marquee-track {
    animation-play-state: paused;
  }
}

.marquee-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding-right: 2.5rem;
  color: var(--text-muted);
  font-family: var(--font-display);
  font-size: 1.4rem;
  white-space: nowrap;
}

@keyframes marquee {
  to {
    transform: translateX(-50%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .marquee-track {
    flex-wrap: wrap;
    justify-content: center;
    gap: 2.5rem;
    width: auto;
    animation: none;
  }

  .marquee-item {
    padding-right: 0;
  }

  .marquee-item[data-duplicate] {
    display: none;
  }
}
```

En `src/components/TechMarquee.jsx` añadir `import './css/TechMarquee.css'` debajo del import de `TECH`.

- [ ] **Step 5: Home, datos y limpieza**
  - `src/routes/home.jsx`: quitar imports y usos de `About`, `Experience` y `Education`; importar `WhoAmI` y `Now` y renderizar, después de `<Process ... />`: `<WhoAmI reducedMotion={reducedMotion} />` y `<Now />`. El orden queda Hero, Services, Cases, Process, WhoAmI, Now, Contact.
  - `src/data/profile.js`: borrar `bio` y `stats`.
  - `src/data/skills.js`: borrar `skillCategories`.
  - `src/data/data.test.js` (reemplazar entero):

```js
import { describe, it, expect } from 'vitest'
import { localize } from './localize'
import { profile } from './profile'
import { NAV_ITEMS, SECTIONS, SECTION_IDS } from './sections'
import { experience } from './experience'
import { TECH } from './skills'
import { strings } from '../i18n/strings'

const isLocalized = (v) => Boolean(v) && typeof v === 'object' && v.es !== undefined && v.en !== undefined

describe('localize', () => {
  it('returns the requested language', () => {
    expect(localize({ es: 'Hola', en: 'Hi' }, 'en')).toBe('Hi')
  })
  it('falls back to Spanish for unknown languages', () => {
    expect(localize({ es: 'Hola', en: 'Hi' }, 'fr')).toBe('Hola')
  })
  it('returns plain values untouched', () => {
    expect(localize('React', 'en')).toBe('React')
  })
})

describe('content', () => {
  it('orders experience from most recent to oldest', () => {
    const ends = experience.map((job) => job.end ?? '9999-12')
    expect([...ends].sort().reverse()).toEqual(ends)
  })

  it('lists Web Developer at Macrosad as the current job', () => {
    expect(experience[0]).toMatchObject({
      role: { es: 'Web Developer', en: 'Web Developer' },
      company: 'Macrosad',
      end: null,
    })
  })

  it('has every translatable field in es and en', () => {
    for (const job of experience) {
      expect(isLocalized(job.role), job.id).toBe(true)
      expect(isLocalized(job.period), job.id).toBe(true)
      expect(job.tasks.es.length, job.id).toBe(job.tasks.en.length)
    }
    for (const section of SECTIONS) expect(isLocalized(section.label), section.id).toBe(true)
    for (const item of NAV_ITEMS) expect(isLocalized(item.label), item.id).toBe(true)
    for (const [key, value] of Object.entries(strings)) expect(isLocalized(value), key).toBe(true)
    expect(isLocalized(profile.location)).toBe(true)
  })

  it('uses unique section ids in page order', () => {
    expect(SECTION_IDS).toEqual(['hero', 'servicios', 'casos', 'proceso', 'quien-soy', 'ahora', 'brief'])
  })

  it('gives every technology a name, an icon and a colour', () => {
    for (const [id, tech] of Object.entries(TECH)) {
      expect(tech.name, id).toBeTruthy()
      expect(typeof tech.Icon, id).toBe('function')
      expect(tech.color, id).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })
})
```

```bash
git rm src/components/About.jsx src/components/About.test.jsx src/components/css/About.css src/components/Experience.jsx src/components/Experience.test.jsx src/components/css/Experience.css src/components/Education.jsx src/components/Education.test.jsx src/components/css/Education.css src/components/CountUp.jsx src/components/CountUp.test.jsx src/data/education.js
```

- [ ] **Step 6: Tests, lint, build**

Run: `npm test && npm run lint && npm run build`
Expected: todo en verde, y `grep -rnE "CountUp|skillCategories|profile\.bio|profile\.stats|from './education'|from '../data/education'" src` no encuentra nada.

- [ ] **Step 7: Comprobación visual (juicio)**

`npm run dev`, 1440 y 375: el gancho grande; el texto "se lee solo" (palabras de tenue a opaco con el scroll); las cuatro paradas se encienden en cadena; al pasar el ratón, enfocar con teclado o tocar, cada parada muestra puesto y fechas; a 375 la trayectoria es vertical con los datos visibles. La marquesina sigue debajo. "Ahora mismo" es un bloque pequeño con "actualizado octubre 2026". Con reduced motion el texto es opaco desde el principio.

- [ ] **Step 8: Commit**

```bash
git add src/components/WhoAmI.jsx src/components/WhoAmI.test.jsx src/components/css/WhoAmI.css src/components/Now.jsx src/components/Now.test.jsx src/components/css/Now.css src/components/css/TechMarquee.css src/components/TechMarquee.jsx src/lib/format.js src/lib/format.test.js src/routes/home.jsx src/data/profile.js src/data/skills.js src/data/data.test.js src/i18n/strings.js
git commit -m "Replace about, experience and education with who-am-I and right-now

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---
### Task 11: Esquema compartido del brief y sus textos

> **Tipo:** transcripción pura. Modelo económico.

**Files:**
- Create: `src/lib/briefSchema.js`, `src/lib/briefSchema.test.js`, `src/data/brief.js`, `src/data/brief.test.js`

**Interfaces:**
- Consumes: nada (ambos archivos **sin imports**: Node los carga tal cual desde `/api/brief`).
- Produces:
  - `src/lib/briefSchema.js`: `BRIEF_TYPES = ['web','tool','app','unsure']`, `BRIEF_TIMELINES = ['asap','1-3m','no-rush']`, `BRIEF_TAGS: Record<type, string[]>`, `LIMITS = { detailsMin: 20, detailsMax: 2000, name: 100, email: 254, phone: 30 }`, `MIN_ELAPSED_MS = 3000`, `MAX_BODY_BYTES = 10240`, `STEP_FIELDS` (4 pasos), `STEP_COUNT = 4`, `EMPTY_BRIEF`, `characterCount(value)` (puntos de código), `normalizeBrief(input)`, `validateStep(input, step) → errors`, `validateBrief(input) → { ok, value, errors }`, `firstStepWithError(errors) → índice | -1`, `isSpam({ website, elapsedMs }) → boolean`. Códigos de error: `required`, `invalid_choice`, `too_short`, `too_long`, `invalid_email`, `invalid_phone`, `must_accept`.
  - `src/data/brief.js`: `briefTypes: Array<{ id, label, hint }>`, `briefTagLabels: Record<tagId, Localized>`, `briefTimelines: Array<{ id, label }>`.

- [ ] **Step 1: Escribir los tests que fallan**

`src/lib/briefSchema.test.js`:

```js
import { describe, expect, it } from 'vitest'
import {
  characterCount,
  firstStepWithError,
  isSpam,
  LIMITS,
  normalizeBrief,
  validateBrief,
  validateStep,
} from './briefSchema'

const VALID = {
  type: 'web',
  details: 'Quiero una web para mi peluquería con reservas online.',
  tags: ['booking'],
  timeline: '1-3m',
  name: 'Ana',
  email: 'ana@example.es',
  phone: '',
  privacy: true,
}

const errorsFor = (patch) => validateBrief({ ...VALID, ...patch }).errors

describe('validateBrief', () => {
  it('accepts a complete brief and normalises it', () => {
    const { ok, value, errors } = validateBrief({
      ...VALID,
      name: '  Ana  ',
      email: ' Ana@Example.ES ',
      tags: ['booking', 'booking'],
      website: 'ignored',
      elapsedMs: 9000,
    })
    expect(ok).toBe(true)
    expect(errors).toEqual({})
    expect(value).toEqual({ ...VALID, name: 'Ana', email: 'ana@example.es', tags: ['booking'] })
  })

  it('requires a known project type', () => {
    expect(errorsFor({ type: '' }).type).toBe('required')
    expect(errorsFor({ type: 'shop' }).type).toBe('invalid_choice')
  })

  it('asks for 20 to 2000 real characters of detail', () => {
    expect(errorsFor({ details: '' }).details).toBe('required')
    expect(errorsFor({ details: `${'a'.repeat(19)}   ` }).details).toBe('too_short')
    expect(errorsFor({ details: 'a'.repeat(LIMITS.detailsMax + 1) }).details).toBe('too_long')
  })

  it('counts emoji as one character each', () => {
    expect(characterCount('😀😀')).toBe(2)
    expect(errorsFor({ details: '😀'.repeat(2000) }).details).toBeUndefined()
    expect(errorsFor({ details: '😀'.repeat(2001) }).details).toBe('too_long')
  })

  it('only allows the quick tags of the chosen type', () => {
    expect(errorsFor({ tags: ['spreadsheets'] }).tags).toBe('invalid_choice')
    expect(errorsFor({ type: 'unsure', tags: ['booking'] }).tags).toBe('invalid_choice')
    expect(errorsFor({ tags: [] }).tags).toBeUndefined()
  })

  it('requires a known timeline', () => {
    expect(errorsFor({ timeline: '' }).timeline).toBe('required')
    expect(errorsFor({ timeline: 'tomorrow' }).timeline).toBe('invalid_choice')
  })

  it('requires a name of sensible length', () => {
    expect(errorsFor({ name: '   ' }).name).toBe('required')
    expect(errorsFor({ name: 'a'.repeat(101) }).name).toBe('too_long')
  })

  it('requires a valid email', () => {
    expect(errorsFor({ email: '' }).email).toBe('required')
    for (const email of ['ana@', 'ana@example', 'a b@example.es', 'ana.example.es']) {
      expect(errorsFor({ email }).email, email).toBe('invalid_email')
    }
  })

  it('accepts an optional phone number', () => {
    expect(errorsFor({ phone: '' }).phone).toBeUndefined()
    expect(errorsFor({ phone: '+34 600 00 00 00' }).phone).toBeUndefined()
    expect(errorsFor({ phone: 'llámame' }).phone).toBe('invalid_phone')
  })

  it('needs an explicit privacy consent', () => {
    expect(errorsFor({ privacy: false }).privacy).toBe('must_accept')
    expect(errorsFor({ privacy: 'true' }).privacy).toBe('must_accept')
  })

  it('survives garbage input', () => {
    expect(validateBrief(null).ok).toBe(false)
    expect(normalizeBrief({ tags: 'web', name: 42 })).toMatchObject({ tags: [], name: '' })
  })
})

describe('steps', () => {
  it('validates only the fields of the current step', () => {
    expect(validateStep({}, 0)).toEqual({ type: 'required' })
    expect(validateStep({ type: 'app' }, 1)).toEqual({ details: 'required' })
    expect(validateStep({}, 2)).toEqual({ timeline: 'required' })
    expect(validateStep({}, 3)).toEqual({ name: 'required', email: 'required', privacy: 'must_accept' })
  })

  it('finds the first step with an error', () => {
    expect(firstStepWithError({ email: 'invalid_email', timeline: 'required' })).toBe(2)
    expect(firstStepWithError({ tags: 'invalid_choice' })).toBe(1)
    expect(firstStepWithError({})).toBe(-1)
  })
})

describe('isSpam', () => {
  it('flags a filled honeypot or a submission faster than 3 seconds', () => {
    expect(isSpam({ website: '', elapsedMs: 3000 })).toBe(false)
    expect(isSpam({ website: 'http://spam.example', elapsedMs: 60000 })).toBe(true)
    expect(isSpam({ website: '', elapsedMs: 2999 })).toBe(true)
    expect(isSpam({ website: '' })).toBe(true)
    expect(isSpam({ website: '', elapsedMs: 'soon' })).toBe(true)
  })
})
```

`src/data/brief.test.js`:

```js
import { describe, expect, it } from 'vitest'
import { briefTagLabels, briefTimelines, briefTypes } from './brief'
import { BRIEF_TAGS, BRIEF_TIMELINES, BRIEF_TYPES } from '../lib/briefSchema'

const isLocalized = (v) => Boolean(v) && typeof v.es === 'string' && typeof v.en === 'string' && v.es && v.en

describe('brief copy', () => {
  it('labels every type, with a hint, in both languages', () => {
    expect(briefTypes.map((type) => type.id)).toEqual(BRIEF_TYPES)
    for (const type of briefTypes) expect(isLocalized(type.label) && isLocalized(type.hint), type.id).toBeTruthy()
    expect(briefTypes.map((type) => type.label.es)).toEqual(['Una web', 'Una herramienta', 'Una app', 'Aún no lo sé'])
  })

  it('labels every timeline and every quick tag', () => {
    expect(briefTimelines.map((item) => item.id)).toEqual(BRIEF_TIMELINES)
    expect(briefTimelines.map((item) => item.label.es)).toEqual(['Lo antes posible', 'En 1–3 meses', 'Sin prisa'])
    const tagIds = Object.values(BRIEF_TAGS).flat()
    expect(Object.keys(briefTagLabels).sort()).toEqual([...tagIds].sort())
    for (const id of tagIds) expect(isLocalized(briefTagLabels[id]), id).toBeTruthy()
    expect(briefTagLabels.redo.es).toBe('Ya tengo web y quiero renovarla')
    expect(briefTagLabels.booking.es).toBe('Necesito reservas')
    expect(briefTagLabels.shop.es).toBe('Necesito tienda online')
  })
})
```

- [ ] **Step 2: Ejecutar y verlos fallar**

Run: `npx vitest run src/lib/briefSchema.test.js src/data/brief.test.js`
Expected: FAIL — `Failed to resolve import "./briefSchema"` y `"./brief"`.

- [ ] **Step 3: Esquema** — `src/lib/briefSchema.js`:

```js
// Shared by the brief form (browser) and /api/brief (Node). Keep it import-free: Node loads it directly.
export const BRIEF_TYPES = ['web', 'tool', 'app', 'unsure']
export const BRIEF_TIMELINES = ['asap', '1-3m', 'no-rush']
export const BRIEF_TAGS = {
  web: ['redo', 'booking', 'shop'],
  tool: ['spreadsheets', 'client-area', 'integrations'],
  app: ['ios-android', 'accounts', 'notifications'],
  unsure: [],
}
export const LIMITS = { detailsMin: 20, detailsMax: 2000, name: 100, email: 254, phone: 30 }
export const MIN_ELAPSED_MS = 3000
export const MAX_BODY_BYTES = 10 * 1024
export const STEP_FIELDS = [['type'], ['details', 'tags'], ['timeline'], ['name', 'email', 'phone', 'privacy']]
export const STEP_COUNT = STEP_FIELDS.length
export const EMPTY_BRIEF = { type: '', details: '', tags: [], timeline: '', name: '', email: '', phone: '', privacy: false }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE = /^\+?[\d\s().-]{6,30}$/

// Code points, not UTF-16 units: an emoji counts as one character.
export const characterCount = (value) => [...value].length

const text = (value) => (typeof value === 'string' ? value.trim() : '')

export function normalizeBrief(input) {
  const source = input && typeof input === 'object' ? input : {}
  return {
    type: text(source.type),
    details: text(source.details),
    tags: Array.isArray(source.tags) ? [...new Set(source.tags.filter((tag) => typeof tag === 'string'))] : [],
    timeline: text(source.timeline),
    name: text(source.name),
    email: text(source.email).toLowerCase(),
    phone: text(source.phone),
    privacy: source.privacy === true,
  }
}

const CHECKS = {
  type: ({ type }) => (BRIEF_TYPES.includes(type) ? null : type ? 'invalid_choice' : 'required'),
  details: ({ details }) => {
    const length = characterCount(details)
    if (length === 0) return 'required'
    if (length < LIMITS.detailsMin) return 'too_short'
    return length > LIMITS.detailsMax ? 'too_long' : null
  },
  tags: ({ type, tags }) => {
    const allowed = BRIEF_TAGS[type] ?? []
    return tags.every((tag) => allowed.includes(tag)) ? null : 'invalid_choice'
  },
  timeline: ({ timeline }) => (BRIEF_TIMELINES.includes(timeline) ? null : timeline ? 'invalid_choice' : 'required'),
  name: ({ name }) => (!name ? 'required' : characterCount(name) > LIMITS.name ? 'too_long' : null),
  email: ({ email }) => {
    if (!email) return 'required'
    return email.length > LIMITS.email || !EMAIL_RE.test(email) ? 'invalid_email' : null
  },
  phone: ({ phone }) => (!phone || PHONE_RE.test(phone) ? null : 'invalid_phone'),
  privacy: ({ privacy }) => (privacy ? null : 'must_accept'),
}

function collect(brief, fields) {
  const errors = {}
  for (const field of fields) {
    const code = CHECKS[field](brief)
    if (code) errors[field] = code
  }
  return errors
}

export function validateStep(input, step) {
  return collect(normalizeBrief(input), STEP_FIELDS[step] ?? [])
}

export function validateBrief(input) {
  const value = normalizeBrief(input)
  const errors = collect(value, Object.keys(CHECKS))
  return { ok: Object.keys(errors).length === 0, value, errors }
}

export function firstStepWithError(errors) {
  return STEP_FIELDS.findIndex((fields) => fields.some((field) => field in errors))
}

export function isSpam(input) {
  const website = input?.website
  if (website !== undefined && website !== '') return true
  const elapsed = input?.elapsedMs
  return !(typeof elapsed === 'number' && Number.isFinite(elapsed) && elapsed >= MIN_ELAPSED_MS)
}
```

- [ ] **Step 4: Textos del brief** — `src/data/brief.js` (las etiquetas rápidas de herramienta y app son copy nuevo: Miguel las revisa):

```js
// Import-free: /api/brief reads the Spanish labels from here for the e-mail.
export const briefTypes = [
  {
    id: 'web',
    label: { es: 'Una web', en: 'A website' },
    hint: {
      es: '¿A qué se dedica tu negocio y qué debería conseguir la web?',
      en: 'What does your business do, and what should the website achieve?',
    },
  },
  {
    id: 'tool',
    label: { es: 'Una herramienta', en: 'A tool' },
    hint: {
      es: '¿Qué haces hoy a mano y cuánto tiempo te lleva?',
      en: 'What do you do by hand today, and how long does it take?',
    },
  },
  {
    id: 'app',
    label: { es: 'Una app', en: 'An app' },
    hint: {
      es: '¿Quién la usaría y qué tendría que poder hacer?',
      en: 'Who would use it, and what should it let them do?',
    },
  },
  {
    id: 'unsure',
    label: { es: 'Aún no lo sé', en: "I'm not sure yet" },
    hint: {
      es: 'Cuéntame el problema que quieres resolver; lo demás lo vemos juntos.',
      en: "Tell me the problem you want to solve; we'll work out the rest together.",
    },
  },
]

export const briefTagLabels = {
  redo: { es: 'Ya tengo web y quiero renovarla', en: 'I already have a website and want to redo it' },
  booking: { es: 'Necesito reservas', en: 'I need bookings' },
  shop: { es: 'Necesito tienda online', en: 'I need an online shop' },
  spreadsheets: { es: 'Sustituir hojas de Excel', en: 'Replace spreadsheets' },
  'client-area': { es: 'Un área para mis clientes', en: 'An area for my clients' },
  integrations: { es: 'Conectar programas que ya uso', en: 'Connect tools I already use' },
  'ios-android': { es: 'Para iOS y Android', en: 'For iOS and Android' },
  accounts: { es: 'Con registro de usuarios', en: 'With user accounts' },
  notifications: { es: 'Con notificaciones', en: 'With notifications' },
}

export const briefTimelines = [
  { id: 'asap', label: { es: 'Lo antes posible', en: 'As soon as possible' } },
  { id: '1-3m', label: { es: 'En 1–3 meses', en: 'In 1–3 months' } },
  { id: 'no-rush', label: { es: 'Sin prisa', en: 'No rush' } },
]
```

- [ ] **Step 5: Tests, lint, build**

Run: `npm test && npm run lint && npm run build`
Expected: todo en verde.

- [ ] **Step 6: Commit**

```bash
git add src/lib/briefSchema.js src/lib/briefSchema.test.js src/data/brief.js src/data/brief.test.js
git commit -m "Add the shared brief schema and its bilingual labels

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: `/api/brief` — Vercel Function con Resend

> **Tipo:** transcripción pura (handler testeable con Resend inyectado). Modelo económico.

**Files:**
- Create: `server/briefHandler.js`, `server/briefHandler.test.js`, `api/brief.js`, `src/lib/escapeHtml.js`, `src/lib/escapeHtml.test.js`
- Modify: `package.json`, `package-lock.json`, `vercel.json`

**Interfaces:**
- Consumes: `isSpam`, `MAX_BODY_BYTES`, `validateBrief` (Tarea 11), `briefTypes`, `briefTimelines`, `briefTagLabels` (Tarea 11).
- Produces:
  - `escapeHtml(value) → string` (escapa `& < > " '`).
  - `createRateLimiter({ limit = 5, windowMs = 3_600_000, now = Date.now }) → { hit(key) → boolean }`.
  - `renderBriefEmail(brief) → { subject, text, html }` (asunto `Nuevo brief: <tipo> — <nombre>`).
  - `createBriefHandler({ getResend, env, limiter?, logger? }) → (request: Request) => Promise<Response>`. Respuestas JSON con `Cache-Control: no-store`: `200 {ok:true}` · `400 {error:'invalid', fields: string[]}` · `405 {error:'method_not_allowed'}` + `Allow: POST` · `413 {error:'too_large'}` · `429 {error:'rate_limited'}` · `500 {error:'send_failed'}`.
  - `api/brief.js`: `export default { fetch }` (formato Web de Vercel Functions en Node). Variables: `RESEND_API_KEY`, `BRIEF_TO_EMAIL`, `BRIEF_FROM_EMAIL` (por defecto `onboarding@resend.dev`).
- Regla: todo lo que importa `api/` o `server/` usa rutas relativas **con extensión `.js`** y módulos sin imports extensionless (Node ESM puro en Vercel).

- [ ] **Step 1: Instalar Resend**

```bash
npm install resend@^6.32.0
```

Expected: `resend@6.32.x` en `dependencies`.

- [ ] **Step 2: Escribir los tests que fallan**

`src/lib/escapeHtml.test.js`:

```js
import { describe, expect, it } from 'vitest'
import { escapeHtml } from './escapeHtml'

describe('escapeHtml', () => {
  it('neutralises markup and quotes', () => {
    expect(escapeHtml(`<a href="x" onclick='y'>&</a>`)).toBe('&lt;a href=&quot;x&quot; onclick=&#39;y&#39;&gt;&amp;&lt;/a&gt;')
  })

  it('stringifies other values', () => {
    expect(escapeHtml(42)).toBe('42')
  })
})
```

`server/briefHandler.test.js`:

```js
// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import { createBriefHandler, createRateLimiter, renderBriefEmail } from './briefHandler.js'
import { MAX_BODY_BYTES } from '../src/lib/briefSchema.js'

const VALID = {
  type: 'web',
  details: 'Quiero una web para mi peluquería con reservas online.',
  tags: ['booking'],
  timeline: '1-3m',
  name: 'Ana',
  email: 'ana@example.es',
  phone: '',
  privacy: true,
  website: '',
  elapsedMs: 45000,
}
const ENV = { BRIEF_TO_EMAIL: 'miguel@example.es', BRIEF_FROM_EMAIL: 'Portfolio <brief@example.es>' }

function setup({ send = vi.fn().mockResolvedValue({ data: { id: 'email_1' }, error: null }), env = ENV, limiter } = {}) {
  const logger = { error: vi.fn() }
  const handler = createBriefHandler({ getResend: () => ({ emails: { send } }), env, limiter, logger })
  return { handler, send, logger }
}

function post(body, { ip = '203.0.113.7', raw } = {}) {
  return new Request('https://example.dev/api/brief', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': `${ip}, 10.0.0.1` },
    body: raw ?? JSON.stringify(body),
  })
}

describe('POST /api/brief', () => {
  it('sends the brief to Miguel with the client as reply-to', async () => {
    const { handler, send } = setup()
    const response = await handler(post(VALID))
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(await response.json()).toEqual({ ok: true })
    expect(send).toHaveBeenCalledTimes(1)
    const email = send.mock.calls[0][0]
    expect(email).toMatchObject({
      from: 'Portfolio <brief@example.es>',
      to: 'miguel@example.es',
      replyTo: 'ana@example.es',
      subject: 'Nuevo brief: Una web — Ana',
    })
    expect(email.text).toContain('Quiero una web para mi peluquería con reservas online.')
    expect(email.text).toContain('Necesito reservas')
    expect(email.text).toContain('En 1–3 meses')
  })

  it('sends from the Resend sandbox address until a domain is verified', async () => {
    const { handler, send } = setup({ env: { BRIEF_TO_EMAIL: 'miguel@example.es' } })
    await handler(post(VALID))
    expect(send.mock.calls[0][0].from).toBe('onboarding@resend.dev')
  })

  it('escapes every user value in the HTML version', async () => {
    const { handler, send } = setup()
    await handler(post({ ...VALID, name: '<script>alert(1)</script>', details: '<img src=x onerror=alert(1)> y más texto aquí' }))
    const { html, text } = send.mock.calls[0][0]
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;')
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('<img')
    expect(text).toContain('<script>alert(1)</script>')
  })

  it('rejects invalid briefs with the failing fields and sends nothing', async () => {
    const { handler, send } = setup()
    const response = await handler(post({ ...VALID, details: 'corto', email: 'nope' }))
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'invalid', fields: ['details', 'email'] })
    expect(send).not.toHaveBeenCalled()
  })

  it('rejects a filled honeypot and submissions under 3 seconds', async () => {
    const { handler, send } = setup()
    for (const body of [{ ...VALID, website: 'http://spam.example' }, { ...VALID, elapsedMs: 1200 }, { ...VALID, elapsedMs: undefined }]) {
      const response = await handler(post(body))
      expect(response.status).toBe(400)
      expect(await response.json()).toEqual({ error: 'invalid', fields: [] })
    }
    expect(send).not.toHaveBeenCalled()
  })

  it('rejects malformed JSON and non-object bodies', async () => {
    const { handler } = setup()
    expect((await handler(post(null, { raw: '{"type":' }))).status).toBe(400)
    expect((await handler(post(null, { raw: '[]' }))).status).toBe(400)
  })

  it('only accepts POST', async () => {
    const { handler } = setup()
    const response = await handler(new Request('https://example.dev/api/brief'))
    expect(response.status).toBe(405)
    expect(response.headers.get('allow')).toBe('POST')
  })

  it('rejects bodies over 10 KB', async () => {
    const { handler, send } = setup()
    const response = await handler(post({ ...VALID, details: 'a'.repeat(MAX_BODY_BYTES) }))
    expect(response.status).toBe(413)
    expect(await response.json()).toEqual({ error: 'too_large' })
    expect(send).not.toHaveBeenCalled()
  })

  it('allows 5 briefs per hour per IP', async () => {
    const { handler } = setup()
    for (let i = 0; i < 5; i += 1) expect((await handler(post(VALID))).status).toBe(200)
    const blocked = await handler(post(VALID))
    expect(blocked.status).toBe(429)
    expect(await blocked.json()).toEqual({ error: 'rate_limited' })
    expect((await handler(post(VALID, { ip: '198.51.100.2' }))).status).toBe(200)
  })

  it('answers 500 without internal details when Resend fails or is not configured', async () => {
    const failures = [
      setup({ send: vi.fn().mockResolvedValue({ data: null, error: { message: 'API key is invalid' } }) }),
      setup({ send: vi.fn().mockRejectedValue(new Error('ECONNRESET')) }),
      setup({ env: {} }),
    ]
    for (const { handler, logger } of failures) {
      const response = await handler(post(VALID))
      expect(response.status).toBe(500)
      expect(await response.json()).toEqual({ error: 'send_failed' })
      expect(logger.error).toHaveBeenCalled()
    }
  })
})

describe('createRateLimiter', () => {
  it('forgets hits older than the window', () => {
    let now = 0
    const limiter = createRateLimiter({ limit: 2, windowMs: 1000, now: () => now })
    expect(limiter.hit('ip')).toBe(true)
    expect(limiter.hit('ip')).toBe(true)
    expect(limiter.hit('ip')).toBe(false)
    now = 1001
    expect(limiter.hit('ip')).toBe(true)
  })
})

describe('renderBriefEmail', () => {
  it('keeps the subject on one line', () => {
    const { subject } = renderBriefEmail({ ...VALID, name: 'Ana\r\nBcc: x@example.es' })
    expect(subject).toBe('Nuevo brief: Una web — Ana Bcc: x@example.es')
  })
})
```

- [ ] **Step 3: Ejecutar y verlos fallar**

Run: `npx vitest run src/lib/escapeHtml.test.js server/briefHandler.test.js`
Expected: FAIL — módulos inexistentes.

- [ ] **Step 4: Implementación**

`src/lib/escapeHtml.js`:

```js
const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ENTITIES[char])
}
```

`server/briefHandler.js`:

```js
import { isSpam, MAX_BODY_BYTES, validateBrief } from '../src/lib/briefSchema.js'
import { briefTagLabels, briefTimelines, briefTypes } from '../src/data/brief.js'
import { escapeHtml } from '../src/lib/escapeHtml.js'

const DEFAULT_FROM = 'onboarding@resend.dev'
const labelOf = (list, id) => list.find((item) => item.id === id)?.label.es ?? id

function json(status, body, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  })
}

// In-memory and per instance: a best-effort limit, accepted as such in the spec (§9).
export function createRateLimiter({ limit = 5, windowMs = 60 * 60 * 1000, now = Date.now } = {}) {
  const hits = new Map()
  return {
    hit(key) {
      const time = now()
      const recent = (hits.get(key) ?? []).filter((stamp) => time - stamp < windowMs)
      const allowed = recent.length < limit
      if (allowed) recent.push(time)
      hits.set(key, recent)
      return allowed
    },
  }
}

function clientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown'
}

export function renderBriefEmail(brief) {
  const type = labelOf(briefTypes, brief.type)
  const rows = [
    ['Qué quiere construir', type],
    ['Etiquetas', brief.tags.map((tag) => briefTagLabels[tag]?.es ?? tag).join(', ') || '—'],
    ['Para cuándo', labelOf(briefTimelines, brief.timeline)],
    ['Nombre', brief.name],
    ['Email', brief.email],
    ['Teléfono', brief.phone || '—'],
  ]
  const subject = `Nuevo brief: ${type} — ${brief.name}`.replace(/[\r\n]+/g, ' ')
  const text = [
    'Nuevo brief desde el portfolio',
    '',
    ...rows.map(([label, value]) => `${label}: ${value}`),
    '',
    'Proyecto:',
    brief.details,
  ].join('\n')
  const html = [
    '<div style="font-family:system-ui,sans-serif;color:#111">',
    '<h1 style="font-size:20px">Nuevo brief desde el portfolio</h1>',
    '<table style="border-collapse:collapse">',
    ...rows.map(
      ([label, value]) =>
        `<tr><th align="left" style="padding:4px 16px 4px 0">${escapeHtml(label)}</th><td style="padding:4px 0">${escapeHtml(value)}</td></tr>`,
    ),
    '</table>',
    '<h2 style="font-size:16px">Proyecto</h2>',
    `<p style="white-space:pre-wrap">${escapeHtml(brief.details)}</p>`,
    '</div>',
  ].join('')
  return { subject, text, html }
}

export function createBriefHandler({ getResend, env, limiter = createRateLimiter(), logger = console }) {
  return async function handleBrief(request) {
    if (request.method !== 'POST') return json(405, { error: 'method_not_allowed' }, { Allow: 'POST' })
    if (!limiter.hit(clientIp(request))) return json(429, { error: 'rate_limited' })

    if (Number(request.headers.get('content-length')) > MAX_BODY_BYTES) return json(413, { error: 'too_large' })
    const raw = await request.text()
    if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return json(413, { error: 'too_large' })

    let body
    try {
      body = JSON.parse(raw)
    } catch {
      return json(400, { error: 'invalid', fields: [] })
    }
    if (!body || typeof body !== 'object' || Array.isArray(body) || isSpam(body)) {
      return json(400, { error: 'invalid', fields: [] })
    }

    const { ok, value, errors } = validateBrief(body)
    if (!ok) return json(400, { error: 'invalid', fields: Object.keys(errors) })

    try {
      if (!env.BRIEF_TO_EMAIL) throw new Error('BRIEF_TO_EMAIL is not set')
      const email = renderBriefEmail(value)
      const { error } = await getResend().emails.send({
        from: env.BRIEF_FROM_EMAIL || DEFAULT_FROM,
        to: env.BRIEF_TO_EMAIL,
        replyTo: value.email,
        subject: email.subject,
        text: email.text,
        html: email.html,
      })
      if (error) throw new Error(error.message ?? 'Resend error')
      return json(200, { ok: true })
    } catch (error) {
      logger.error('brief: send failed', error instanceof Error ? error.message : error)
      return json(500, { error: 'send_failed' })
    }
  }
}
```

`api/brief.js`:

```js
import { Resend } from 'resend'
import { createBriefHandler } from '../server/briefHandler.js'

let resend
const handleBrief = createBriefHandler({
  // Created on the first request: `new Resend()` throws when RESEND_API_KEY is missing,
  // and the handler turns that into a 500 instead of crashing the function at import time.
  getResend: () => (resend ??= new Resend(process.env.RESEND_API_KEY)),
  env: process.env,
})

export default { fetch: handleBrief }
```

`vercel.json`: añadir la clave `"functions"` (el archivo queda así):

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": null,
  "buildCommand": "npm run build",
  "outputDirectory": "build/client",
  "cleanUrls": true,
  "trailingSlash": false,
  "functions": {
    "api/brief.js": { "maxDuration": 10 }
  }
}
```

- [ ] **Step 5: Tests y comprobación de que Node carga la función tal cual**

Run: `npx vitest run src/lib/escapeHtml.test.js server/briefHandler.test.js`
Expected: PASS.

Run: `node -e "import('./api/brief.js').then((m) => console.log(typeof m.default.fetch))"`
Expected: `function` (prueba que la cadena de imports es ESM válido para Node, como en Vercel).

- [ ] **Step 6: Lint, build y commit**

Run: `npm test && npm run lint && npm run build`
Expected: todo en verde.

```bash
git add package.json package-lock.json vercel.json api/brief.js server/briefHandler.js server/briefHandler.test.js src/lib/escapeHtml.js src/lib/escapeHtml.test.js
git commit -m "Add the /api/brief Vercel Function sending briefs with Resend

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 13: Estado, borrador y envío del brief (lógica sin UI)

> **Tipo:** transcripción pura. Modelo económico.

**Files:**
- Create: `src/lib/briefState.js`, `src/lib/briefState.test.js`, `src/lib/briefDraft.js`, `src/lib/briefDraft.test.js`, `src/lib/briefClient.js`, `src/lib/briefClient.test.js`

**Interfaces:**
- Consumes: `BRIEF_TAGS`, `EMPTY_BRIEF`, `STEP_COUNT`, `firstStepWithError`, `validateStep` (Tarea 11).
- Produces:
  - `initialBriefState() → { step: 0, data: EMPTY_BRIEF, errors: {}, status: 'editing', failure: null, direction: 'none', attempt: 0 }`.
  - `briefReducer(state, action)` con acciones `restore {draft}`, `change {field, value}`, `toggleTag {tag}`, `next {instant}`, `back {instant}`, `invalid {errors}`, `submitStart`, `submitSuccess`, `submitFailure {kind, fields?}`. `direction ∈ 'forward'|'backward'|'none'` (`'none'` = acción de teclado, sin animación). `attempt` sube en cada validación fallida (la UI enfoca el primer campo inválido).
  - `BRIEF_DRAFT_KEY = 'mdg:brief-draft'`, `loadDraft() → object|null`, `saveDraft(data)` (sin `privacy`), `clearDraft()`; nunca lanzan.
  - `sendBrief(payload, fetchImpl = fetch) → { ok: true } | { ok: false, kind: 'invalid', fields: string[] } | { ok: false, kind: 'rate_limited' } | { ok: false, kind: 'failed' }`.

- [ ] **Step 1: Escribir los tests que fallan**

`src/lib/briefState.test.js`:

```js
import { describe, expect, it } from 'vitest'
import { briefReducer, initialBriefState } from './briefState'
import { EMPTY_BRIEF } from './briefSchema'

const FILLED = {
  type: 'web',
  details: 'Una web para mi peluquería con reservas.',
  tags: ['booking'],
  timeline: 'asap',
  name: 'Ana',
  email: 'ana@example.es',
  phone: '',
  privacy: true,
}
const at = (step, data = FILLED) => ({ ...initialBriefState(), step, data })

describe('briefReducer', () => {
  it('starts empty on the first step', () => {
    expect(initialBriefState()).toEqual({
      step: 0,
      data: EMPTY_BRIEF,
      errors: {},
      status: 'editing',
      failure: null,
      direction: 'none',
      attempt: 0,
    })
  })

  it('restores a draft, keeping only known fields of the right type and never the consent', () => {
    const state = briefReducer(initialBriefState(), {
      type: 'restore',
      draft: { type: 'tool', tags: ['spreadsheets', 3], name: 42, privacy: true, admin: 'yes' },
    })
    expect(state.data).toEqual({ ...EMPTY_BRIEF, type: 'tool', tags: ['spreadsheets'] })
  })

  it('updates a field and clears its error', () => {
    const state = briefReducer({ ...at(3), errors: { email: 'invalid_email' } }, { type: 'change', field: 'email', value: 'a@b.es' })
    expect(state.data.email).toBe('a@b.es')
    expect(state.errors).toEqual({})
  })

  it('drops quick tags that do not fit a new type', () => {
    const state = briefReducer(at(0), { type: 'change', field: 'type', value: 'app' })
    expect(state.data.tags).toEqual([])
  })

  it('toggles quick tags', () => {
    const on = briefReducer(at(1, { ...FILLED, tags: [] }), { type: 'toggleTag', tag: 'shop' })
    expect(on.data.tags).toEqual(['shop'])
    expect(briefReducer(on, { type: 'toggleTag', tag: 'shop' }).data.tags).toEqual([])
  })

  it('only moves forward when the current step is valid', () => {
    const blocked = briefReducer(initialBriefState(), { type: 'next', instant: false })
    expect(blocked).toMatchObject({ step: 0, errors: { type: 'required' }, attempt: 1 })
    const moved = briefReducer(at(0), { type: 'next', instant: false })
    expect(moved).toMatchObject({ step: 1, errors: {}, direction: 'forward' })
    expect(briefReducer(at(0), { type: 'next', instant: true }).direction).toBe('none')
  })

  it('goes back without validating and stays within the four steps', () => {
    expect(briefReducer(at(2, EMPTY_BRIEF), { type: 'back', instant: false })).toMatchObject({ step: 1, direction: 'backward' })
    expect(briefReducer(at(0), { type: 'back', instant: false }).step).toBe(0)
    expect(briefReducer(at(3), { type: 'next', instant: false }).step).toBe(3)
  })

  it('jumps to the first step with an error', () => {
    const state = briefReducer(at(3), { type: 'invalid', errors: { details: 'too_short', email: 'invalid_email' } })
    expect(state).toMatchObject({ step: 1, direction: 'none', attempt: 1 })
  })

  it('tracks sending, failures and success', () => {
    const sending = briefReducer({ ...at(3), failure: 'failed' }, { type: 'submitStart' })
    expect(sending).toMatchObject({ status: 'sending', failure: null })
    expect(briefReducer(sending, { type: 'submitFailure', kind: 'failed' })).toMatchObject({ status: 'editing', failure: 'failed', step: 3 })
    expect(briefReducer(sending, { type: 'submitFailure', kind: 'invalid', fields: ['details'] })).toMatchObject({
      status: 'editing',
      failure: 'invalid',
      step: 1,
      errors: { details: 'invalid' },
    })
    expect(briefReducer(sending, { type: 'submitSuccess' }).status).toBe('success')
  })
})
```

`src/lib/briefDraft.test.js`:

```js
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BRIEF_DRAFT_KEY, clearDraft, loadDraft, saveDraft } from './briefDraft'

beforeEach(() => window.sessionStorage.clear())
afterEach(() => vi.restoreAllMocks())

describe('brief draft', () => {
  it('saves and loads the answers, without the privacy consent', () => {
    saveDraft({ type: 'app', details: 'Una app', tags: [], timeline: '', name: 'Ana', email: '', phone: '', privacy: true })
    expect(JSON.parse(window.sessionStorage.getItem(BRIEF_DRAFT_KEY))).not.toHaveProperty('privacy')
    expect(loadDraft()).toMatchObject({ type: 'app', details: 'Una app', name: 'Ana' })
  })

  it('clears the draft', () => {
    saveDraft({ type: 'web' })
    clearDraft()
    expect(loadDraft()).toBeNull()
  })

  it('ignores corrupted drafts', () => {
    window.sessionStorage.setItem(BRIEF_DRAFT_KEY, '{nope')
    expect(loadDraft()).toBeNull()
  })

  it('never throws when storage is blocked', () => {
    for (const method of ['getItem', 'setItem', 'removeItem']) {
      vi.spyOn(Storage.prototype, method).mockImplementation(() => {
        throw new Error('SecurityError')
      })
    }
    expect(loadDraft()).toBeNull()
    expect(() => saveDraft({ type: 'web' })).not.toThrow()
    expect(() => clearDraft()).not.toThrow()
  })
})
```

`src/lib/briefClient.test.js`:

```js
import { describe, expect, it, vi } from 'vitest'
import { sendBrief } from './briefClient'

const reply = (status, body) => vi.fn().mockResolvedValue(new Response(body === undefined ? null : JSON.stringify(body), { status }))

describe('sendBrief', () => {
  it('posts the brief as JSON to /api/brief', async () => {
    const fetchImpl = reply(200, { ok: true })
    expect(await sendBrief({ type: 'web' }, fetchImpl)).toEqual({ ok: true })
    expect(fetchImpl).toHaveBeenCalledWith('/api/brief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'web' }),
    })
  })

  it('returns the fields the server rejected', async () => {
    expect(await sendBrief({}, reply(400, { error: 'invalid', fields: ['email'] }))).toEqual({
      ok: false,
      kind: 'invalid',
      fields: ['email'],
    })
    expect(await sendBrief({}, vi.fn().mockResolvedValue(new Response('oops', { status: 400 })))).toEqual({
      ok: false,
      kind: 'invalid',
      fields: [],
    })
  })

  it('tells rate limits apart from other failures', async () => {
    expect(await sendBrief({}, reply(429, { error: 'rate_limited' }))).toEqual({ ok: false, kind: 'rate_limited' })
    expect(await sendBrief({}, reply(500, { error: 'send_failed' }))).toEqual({ ok: false, kind: 'failed' })
    expect(await sendBrief({}, vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))).toEqual({ ok: false, kind: 'failed' })
  })
})
```

- [ ] **Step 2: Ejecutar y verlos fallar**

Run: `npx vitest run src/lib/briefState.test.js src/lib/briefDraft.test.js src/lib/briefClient.test.js`
Expected: FAIL — módulos inexistentes.

- [ ] **Step 3: Implementación**

`src/lib/briefState.js`:

```js
import { BRIEF_TAGS, EMPTY_BRIEF, firstStepWithError, STEP_COUNT, validateStep } from './briefSchema'

const TEXT_FIELDS = ['type', 'details', 'timeline', 'name', 'email', 'phone']

export function initialBriefState() {
  return { step: 0, data: EMPTY_BRIEF, errors: {}, status: 'editing', failure: null, direction: 'none', attempt: 0 }
}

// Drafts come from sessionStorage: trust nothing, never restore the consent.
function sanitizeDraft(draft) {
  const clean = {}
  if (!draft || typeof draft !== 'object') return clean
  for (const field of TEXT_FIELDS) if (typeof draft[field] === 'string') clean[field] = draft[field]
  if (Array.isArray(draft.tags)) clean.tags = draft.tags.filter((tag) => typeof tag === 'string')
  return clean
}

function withoutError(errors, field) {
  const next = { ...errors }
  delete next[field]
  return next
}

export function briefReducer(state, action) {
  switch (action.type) {
    case 'restore':
      return { ...state, data: { ...state.data, ...sanitizeDraft(action.draft) } }
    case 'change': {
      const data = { ...state.data, [action.field]: action.value }
      if (action.field === 'type') data.tags = data.tags.filter((tag) => (BRIEF_TAGS[action.value] ?? []).includes(tag))
      return { ...state, data, errors: withoutError(state.errors, action.field) }
    }
    case 'toggleTag': {
      const { tags } = state.data
      const next = tags.includes(action.tag) ? tags.filter((tag) => tag !== action.tag) : [...tags, action.tag]
      return { ...state, data: { ...state.data, tags: next }, errors: withoutError(state.errors, 'tags') }
    }
    case 'next': {
      const errors = validateStep(state.data, state.step)
      if (Object.keys(errors).length > 0) return { ...state, errors, attempt: state.attempt + 1 }
      return {
        ...state,
        errors: {},
        step: Math.min(state.step + 1, STEP_COUNT - 1),
        direction: action.instant ? 'none' : 'forward',
      }
    }
    case 'back':
      return { ...state, errors: {}, step: Math.max(0, state.step - 1), direction: action.instant ? 'none' : 'backward' }
    case 'invalid': {
      const step = firstStepWithError(action.errors)
      return { ...state, errors: action.errors, step: step === -1 ? state.step : step, direction: 'none', attempt: state.attempt + 1 }
    }
    case 'submitStart':
      return { ...state, status: 'sending', failure: null }
    case 'submitSuccess':
      return { ...state, status: 'success', failure: null }
    case 'submitFailure': {
      if (action.kind === 'invalid' && action.fields?.length) {
        const errors = Object.fromEntries(action.fields.map((field) => [field, 'invalid']))
        const step = firstStepWithError(errors)
        return {
          ...state,
          status: 'editing',
          failure: 'invalid',
          errors,
          step: step === -1 ? state.step : step,
          direction: 'none',
          attempt: state.attempt + 1,
        }
      }
      return { ...state, status: 'editing', failure: action.kind }
    }
    default:
      return state
  }
}
```

`src/lib/briefDraft.js`:

```js
export const BRIEF_DRAFT_KEY = 'mdg:brief-draft'

// The privacy consent is never stored: it has to be given again.
const FIELDS = ['type', 'details', 'tags', 'timeline', 'name', 'email', 'phone']

export function loadDraft() {
  try {
    const raw = window.sessionStorage.getItem(BRIEF_DRAFT_KEY)
    if (!raw) return null
    const draft = JSON.parse(raw)
    return draft && typeof draft === 'object' ? draft : null
  } catch {
    return null
  }
}

export function saveDraft(data) {
  try {
    const draft = Object.fromEntries(FIELDS.filter((field) => field in data).map((field) => [field, data[field]]))
    window.sessionStorage.setItem(BRIEF_DRAFT_KEY, JSON.stringify(draft))
  } catch {
    // Storage blocked or full: the form still works, just without a draft.
  }
}

export function clearDraft() {
  try {
    window.sessionStorage.removeItem(BRIEF_DRAFT_KEY)
  } catch {
    // Nothing to clear.
  }
}
```

`src/lib/briefClient.js`:

```js
export async function sendBrief(payload, fetchImpl = globalThis.fetch) {
  try {
    const response = await fetchImpl('/api/brief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (response.ok) return { ok: true }
    if (response.status === 400) {
      const body = await response.json().catch(() => ({}))
      return { ok: false, kind: 'invalid', fields: Array.isArray(body.fields) ? body.fields : [] }
    }
    if (response.status === 429) return { ok: false, kind: 'rate_limited' }
    return { ok: false, kind: 'failed' }
  } catch {
    return { ok: false, kind: 'failed' }
  }
}
```

- [ ] **Step 4: Tests, lint, build**

Run: `npm test && npm run lint && npm run build`
Expected: todo en verde.

- [ ] **Step 5: Commit**

```bash
git add src/lib/briefState.js src/lib/briefState.test.js src/lib/briefDraft.js src/lib/briefDraft.test.js src/lib/briefClient.js src/lib/briefClient.test.js
git commit -m "Add the brief state machine, session draft and API client

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---
### Task 14: Brief guiado "Cuéntame tu proyecto" (sustituye a Contacto)

> **Tipo:** integración con juicio visual (formulario por pasos, foco, animaciones). Modelo capaz.

**Files:**
- Create: `src/components/Brief.jsx`, `src/components/Brief.test.jsx`, `src/components/css/Brief.css`
- Modify: `src/routes/home.jsx`, `src/routes/home.test.jsx`, `src/i18n/strings.js`
- Delete: `src/components/Contact.jsx`, `src/components/Contact.test.jsx`, `src/components/css/Contact.css`

**Interfaces:**
- Consumes: `briefReducer`, `initialBriefState`, `loadDraft`, `saveDraft`, `clearDraft`, `sendBrief` (Tarea 13), `BRIEF_TAGS`, `EMPTY_BRIEF`, `LIMITS`, `STEP_COUNT`, `characterCount`, `validateBrief` (Tarea 11), `briefTypes`, `briefTimelines`, `briefTagLabels` (Tarea 11), `fill` (Tarea 10), `CopyEmailButton`, `SectionHeading`.
- Produces: `<Brief />` con `id="brief"`. El paso visible es un `<fieldset class="brief-step" data-direction>` con su pregunta en `<h3 id="brief-question" tabIndex=-1>`; región `aria-live` con "Paso N de 4: pregunta"; campo trampa `name="website"`; el payload enviado es `validateBrief(data).value + { website, elapsedMs }`.

- [ ] **Step 1: Escribir el test que falla** — `src/components/Brief.test.jsx`:

```jsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Brief from './Brief'
import { BRIEF_DRAFT_KEY } from '../lib/briefDraft'

const json = (status, body) => () => Promise.resolve(new Response(JSON.stringify(body), { status }))

beforeEach(() => {
  window.sessionStorage.clear()
  vi.stubGlobal('fetch', vi.fn(json(200, { ok: true })))
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const next = (user) => user.click(screen.getByRole('button', { name: /Siguiente/ }))
const question = () => document.getElementById('brief-question')

async function fillAll(user) {
  await user.click(screen.getByRole('radio', { name: 'Una web' }))
  await next(user)
  await user.type(screen.getByLabelText('Tu proyecto'), 'Una web para mi peluquería con reservas online.')
  await user.click(screen.getByRole('checkbox', { name: 'Necesito reservas' }))
  await next(user)
  await user.click(screen.getByRole('radio', { name: 'En 1–3 meses' }))
  await next(user)
  await user.type(screen.getByLabelText('Nombre'), 'Ana')
  await user.type(screen.getByLabelText('Email'), 'ana@example.es')
  await user.click(screen.getByRole('checkbox', { name: /política de privacidad/ }))
}

describe('Brief', () => {
  it('asks what to build first and will not move on without an answer', async () => {
    const user = userEvent.setup()
    render(<Brief />)
    expect(question()).toHaveTextContent('¿Qué quieres construir?')
    await next(user)
    expect(question()).toHaveTextContent('¿Qué quieres construir?')
    expect(screen.getByText('Elige una opción.')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Una web' })).toHaveFocus()
  })

  it('shows the hint and the quick tags that fit the chosen type', async () => {
    const user = userEvent.setup()
    render(<Brief />)
    await user.click(screen.getByRole('radio', { name: 'Una app' }))
    await next(user)
    expect(screen.getByText('¿Quién la usaría y qué tendría que poder hacer?')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Con notificaciones' })).toBeInTheDocument()
    expect(screen.queryByRole('checkbox', { name: 'Necesito reservas' })).not.toBeInTheDocument()
  })

  it('asks for a bit more detail when the description is too short', async () => {
    const user = userEvent.setup()
    render(<Brief />)
    await user.click(screen.getByRole('radio', { name: 'Una herramienta' }))
    await next(user)
    await user.type(screen.getByLabelText('Tu proyecto'), 'Un Excel')
    expect(screen.getByText('8 / 2000 caracteres')).toBeInTheDocument()
    await next(user)
    expect(screen.getByText('Cuéntame un poco más (mínimo 20 caracteres).')).toBeInTheDocument()
  })

  it('moves the focus to each new question and announces it', async () => {
    const user = userEvent.setup()
    render(<Brief />)
    await user.click(screen.getByRole('radio', { name: 'Una web' }))
    await next(user)
    expect(question()).toHaveTextContent('Cuéntame un poco más')
    expect(question()).toHaveFocus()
    expect(screen.getByText('Paso 2 de 4: Cuéntame un poco más')).toBeInTheDocument()
    expect(document.querySelector('.brief-step')).toHaveAttribute('data-direction', 'forward')
  })

  it('advances with Enter, without animation', async () => {
    const user = userEvent.setup()
    render(<Brief />)
    await user.click(screen.getByRole('radio', { name: 'Una web' }))
    await user.keyboard('{Enter}')
    expect(question()).toHaveTextContent('Cuéntame un poco más')
    expect(document.querySelector('.brief-step')).toHaveAttribute('data-direction', 'none')
  })

  it('walks through the four steps and sends the brief', async () => {
    const user = userEvent.setup()
    render(<Brief />)
    await fillAll(user)
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    expect(await screen.findByRole('heading', { name: 'Recibido, Ana. Te respondo en menos de 48 h.' })).toHaveFocus()
    expect(fetch).toHaveBeenCalledTimes(1)
    const [url, options] = fetch.mock.calls[0]
    expect(url).toBe('/api/brief')
    expect(JSON.parse(options.body)).toMatchObject({
      type: 'web',
      tags: ['booking'],
      timeline: '1-3m',
      name: 'Ana',
      email: 'ana@example.es',
      privacy: true,
      website: '',
      elapsedMs: expect.any(Number),
    })
    expect(screen.getByText('Una web · Necesito reservas')).toBeInTheDocument()
    expect(screen.getByText('En 1–3 meses')).toBeInTheDocument()
    expect(window.sessionStorage.getItem(BRIEF_DRAFT_KEY)).toBeNull()
  })

  it('keeps a draft for the session and restores it', async () => {
    window.sessionStorage.setItem(
      BRIEF_DRAFT_KEY,
      JSON.stringify({ type: 'tool', details: 'Paso los pedidos a mano a un Excel cada lunes.' }),
    )
    const user = userEvent.setup()
    render(<Brief />)
    expect(await screen.findByRole('radio', { name: 'Una herramienta' })).toBeChecked()
    await next(user)
    expect(screen.getByLabelText('Tu proyecto')).toHaveValue('Paso los pedidos a mano a un Excel cada lunes.')
    await user.type(screen.getByLabelText('Tu proyecto'), ' Y facturas.')
    expect(JSON.parse(window.sessionStorage.getItem(BRIEF_DRAFT_KEY)).details).toMatch(/Y facturas\.$/)
  })

  it('keeps the answers and offers a retry and my email when sending fails', async () => {
    fetch.mockImplementationOnce(json(500, { error: 'send_failed' }))
    const user = userEvent.setup()
    render(<Brief />)
    await fillAll(user)
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    expect(await screen.findByText('No se ha podido enviar. Tus respuestas siguen aquí.')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveValue('ana@example.es')
    expect(screen.getByRole('link', { name: 'miguelangelespeluy@gmail.com' })).toHaveAttribute(
      'href',
      'mailto:miguelangelespeluy@gmail.com',
    )
    await user.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByRole('heading', { name: /^Recibido, Ana\./ })).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('never sends twice while a request is in flight', async () => {
    fetch.mockImplementation(() => new Promise(() => {}))
    const user = userEvent.setup()
    render(<Brief />)
    await fillAll(user)
    const submit = screen.getByRole('button', { name: 'Enviar' })
    await user.click(submit)
    await user.click(submit)
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Enviando…' })).toBeDisabled()
  })

  it('explains the rate limit', async () => {
    fetch.mockImplementationOnce(json(429, { error: 'rate_limited' }))
    const user = userEvent.setup()
    render(<Brief />)
    await fillAll(user)
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    expect(
      await screen.findByText('Has enviado varios mensajes seguidos. Espera un rato o escríbeme directamente.'),
    ).toBeInTheDocument()
  })

  it('takes the visitor to the field the server rejected', async () => {
    fetch.mockImplementationOnce(json(400, { error: 'invalid', fields: ['details'] }))
    const user = userEvent.setup()
    render(<Brief />)
    await fillAll(user)
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    await waitFor(() => expect(question()).toHaveTextContent('Cuéntame un poco más'))
    expect(screen.getByText('Revisa este campo.')).toBeInTheDocument()
    expect(screen.getByLabelText('Tu proyecto')).toHaveFocus()
  })

  it('works when sessionStorage is blocked', async () => {
    for (const method of ['getItem', 'setItem', 'removeItem']) {
      vi.spyOn(Storage.prototype, method).mockImplementation(() => {
        throw new Error('SecurityError')
      })
    }
    const user = userEvent.setup()
    render(<Brief />)
    await fillAll(user)
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    expect(await screen.findByRole('heading', { name: /^Recibido, Ana\./ })).toBeInTheDocument()
  })

  it('offers the other ways to reach me next to the form', () => {
    render(<Brief />)
    expect(screen.getByRole('button', { name: 'Copiar email' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/mdomgar')
  })
})
```

En `src/routes/home.test.jsx` añadir dentro del `describe` (e importar `SECTION_IDS` de `'../data/sections'`):

```jsx
  it('renders every home section in page order', async () => {
    renderPage(Home)
    await screen.findByRole('heading', { level: 1 })
    expect([...document.querySelectorAll('section[id]')].map((section) => section.id)).toEqual(SECTION_IDS)
  })
```

- [ ] **Step 2: Ejecutar y verlo fallar**

Run: `npx vitest run src/components/Brief.test.jsx src/routes/home.test.jsx`
Expected: FAIL — `Failed to resolve import "./Brief"` y la home aún termina en `contact`.

- [ ] **Step 3: Textos** — en `src/i18n/strings.js` borrar `contactTitle`, `contactText` y `writeEmail`, y añadir:

```js
  briefIntro: {
    es: 'Cuatro preguntas rápidas. Aunque no sepas cómo se llama lo que necesitas: te respondo en menos de 48 h.',
    en: "Four quick questions. Even if you don't know what it's called: I'll reply within 48 hours.",
  },
  briefOther: { es: 'Otras formas de hablar conmigo', en: 'Other ways to reach me' },
  briefStepOf: { es: 'Paso {current} de {total}', en: 'Step {current} of {total}' },
  briefQ1: { es: '¿Qué quieres construir?', en: 'What do you want to build?' },
  briefQ2: { es: 'Cuéntame un poco más', en: 'Tell me a bit more' },
  briefQ3: { es: '¿Para cuándo?', en: 'When do you need it?' },
  briefQ4: { es: '¿Cómo te contacto?', en: 'How do I reach you?' },
  briefDetailsLabel: { es: 'Tu proyecto', en: 'Your project' },
  briefCount: { es: '{count} / {max} caracteres', en: '{count} / {max} characters' },
  briefTagsLabel: { es: 'Si encaja, marca lo que aplique (opcional)', en: 'If it fits, tick what applies (optional)' },
  briefName: { es: 'Nombre', en: 'Name' },
  briefEmail: { es: 'Email', en: 'Email' },
  briefPhone: { es: 'Teléfono (opcional)', en: 'Phone (optional)' },
  briefPrivacyBefore: { es: 'He leído la ', en: "I've read the " },
  briefPrivacyLink: { es: 'política de privacidad', en: 'privacy policy' },
  briefPrivacyAfter: {
    es: ' y acepto que uses estos datos para responderme.',
    en: ' and I agree that you use this data to reply to me.',
  },
  briefHoneypot: { es: 'No rellenes este campo', en: 'Leave this field empty' },
  briefNext: { es: 'Siguiente', en: 'Next' },
  briefBack: { es: 'Atrás', en: 'Back' },
  briefSubmit: { es: 'Enviar', en: 'Send' },
  briefSending: { es: 'Enviando…', en: 'Sending…' },
  briefRetry: { es: 'Reintentar', en: 'Try again' },
  briefFailed: {
    es: 'No se ha podido enviar. Tus respuestas siguen aquí.',
    en: "It couldn't be sent. Your answers are still here.",
  },
  briefRateLimited: {
    es: 'Has enviado varios mensajes seguidos. Espera un rato o escríbeme directamente.',
    en: 'You have sent several messages in a row. Wait a while or e-mail me directly.',
  },
  briefInvalid: { es: 'Revisa los campos marcados.', en: 'Please check the highlighted fields.' },
  briefOrEmail: { es: 'o escríbeme a', en: 'or e-mail me at' },
  briefSuccess: { es: 'Recibido, {name}. Te respondo en menos de 48 h.', en: "Got it, {name}. I'll reply within 48 hours." },
  briefSummary: { es: 'Lo que me has contado', en: 'What you told me' },
  summaryType: { es: 'Qué', en: 'What' },
  summaryDetails: { es: 'Detalles', en: 'Details' },
  summaryTimeline: { es: 'Para cuándo', en: 'When' },
  summaryContact: { es: 'Contacto', en: 'Contact' },
  errRequired: { es: 'Este campo es obligatorio.', en: 'This field is required.' },
  errChoose: { es: 'Elige una opción.', en: 'Choose an option.' },
  errTooShort: { es: 'Cuéntame un poco más (mínimo 20 caracteres).', en: 'Tell me a bit more (at least 20 characters).' },
  errTooLong: { es: 'Es demasiado largo.', en: 'It is too long.' },
  errInvalidEmail: { es: 'Revisa el email; parece que falta algo.', en: 'Check the email; something seems to be missing.' },
  errInvalidPhone: { es: 'Revisa el teléfono.', en: 'Check the phone number.' },
  errMustAccept: { es: 'Necesito tu permiso para responderte.', en: 'I need your permission to reply.' },
  errInvalid: { es: 'Revisa este campo.', en: 'Please check this field.' },
```

- [ ] **Step 4: Componente** — `src/components/Brief.jsx`:

```jsx
import { useEffect, useReducer, useRef } from 'react'
import { FaGithub, FaLinkedin } from 'react-icons/fa'
import { FiArrowLeft, FiArrowRight, FiRefreshCw } from 'react-icons/fi'
import { briefTagLabels, briefTimelines, briefTypes } from '../data/brief'
import { localize } from '../data/localize'
import { profile } from '../data/profile'
import { BRIEF_TAGS, characterCount, EMPTY_BRIEF, LIMITS, STEP_COUNT, validateBrief } from '../lib/briefSchema'
import { briefReducer, initialBriefState } from '../lib/briefState'
import { clearDraft, loadDraft, saveDraft } from '../lib/briefDraft'
import { sendBrief } from '../lib/briefClient'
import { fill } from '../lib/format'
import { useLang, useT } from '../i18n/useLang'
import CopyEmailButton from './CopyEmailButton'
import SectionHeading from './SectionHeading'
import './css/Brief.css'

const QUESTIONS = ['briefQ1', 'briefQ2', 'briefQ3', 'briefQ4']
const ERROR_KEYS = {
  required: 'errRequired',
  invalid_choice: 'errChoose',
  too_short: 'errTooShort',
  too_long: 'errTooLong',
  invalid_email: 'errInvalidEmail',
  invalid_phone: 'errInvalidPhone',
  must_accept: 'errMustAccept',
  invalid: 'errInvalid',
}

const labelOf = (list, id, lang) => localize(list.find((item) => item.id === id)?.label, lang) ?? ''
const describedBy = (...ids) => ids.filter(Boolean).join(' ') || undefined
const errorId = (field, code) => (code ? `brief-error-${field}` : undefined)

function FieldError({ field, code }) {
  const t = useT()
  if (!code) return null
  return (
    <p id={`brief-error-${field}`} className="brief-error">
      {t(ERROR_KEYS[code] ?? 'errInvalid')}
    </p>
  )
}

function ChoiceGroup({ name, options, value, error, lang, onChange }) {
  return (
    <div
      className="brief-choices"
      role="radiogroup"
      aria-labelledby="brief-question"
      aria-describedby={errorId(name, error)}
    >
      {options.map((option) => (
        <label key={option.id} className="brief-choice">
          <input
            type="radio"
            name={`brief-${name}`}
            value={option.id}
            checked={value === option.id}
            onChange={() => onChange(option.id)}
            aria-invalid={error ? 'true' : undefined}
          />
          <span>{localize(option.label, lang)}</span>
        </label>
      ))}
    </div>
  )
}

function TextField({ field, label, type = 'text', autoComplete, inputMode, value, error, onChange }) {
  const id = `brief-${field}`
  return (
    <div className="brief-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={errorId(field, error)}
      />
      <FieldError field={field} code={error} />
    </div>
  )
}

function BriefFailure({ kind, sending, onRetry }) {
  const t = useT()
  if (kind === 'invalid') {
    return (
      <p className="brief-failure" role="alert">
        {t('briefInvalid')}
      </p>
    )
  }
  return (
    <div className="brief-failure" role="alert">
      <p>{t(kind === 'rate_limited' ? 'briefRateLimited' : 'briefFailed')}</p>
      <p className="brief-failure-actions">
        {kind !== 'rate_limited' && (
          <button type="button" className="btn" onClick={onRetry} disabled={sending}>
            <FiRefreshCw aria-hidden="true" />
            {t('briefRetry')}
          </button>
        )}
        <span>
          {t('briefOrEmail')} <a href={`mailto:${profile.email}`}>{profile.email}</a>
        </span>
      </p>
    </div>
  )
}

function BriefSuccess({ data, headingRef, lang }) {
  const t = useT()
  const tags = data.tags.map((tag) => localize(briefTagLabels[tag], lang)).join(', ')
  return (
    <div className="brief-success" role="status">
      <svg className="brief-check" viewBox="0 0 52 52" aria-hidden="true">
        <circle cx="26" cy="26" r="24" />
        <path d="M15 27l7 7 15-16" />
      </svg>
      <h3 ref={headingRef} tabIndex={-1}>
        {fill(t('briefSuccess'), { name: data.name.trim() })}
      </h3>
      <p className="brief-summary-title">{t('briefSummary')}</p>
      <dl className="brief-summary">
        <div>
          <dt>{t('summaryType')}</dt>
          <dd>{tags ? `${labelOf(briefTypes, data.type, lang)} · ${tags}` : labelOf(briefTypes, data.type, lang)}</dd>
        </div>
        <div>
          <dt>{t('summaryDetails')}</dt>
          <dd>{data.details.trim()}</dd>
        </div>
        <div>
          <dt>{t('summaryTimeline')}</dt>
          <dd>{labelOf(briefTimelines, data.timeline, lang)}</dd>
        </div>
        <div>
          <dt>{t('summaryContact')}</dt>
          <dd>{[data.name, data.email, data.phone].map((value) => value.trim()).filter(Boolean).join(' · ')}</dd>
        </div>
      </dl>
    </div>
  )
}

export default function Brief() {
  const lang = useLang()
  const t = useT()
  const [state, dispatch] = useReducer(briefReducer, undefined, initialBriefState)
  const { step, data, errors, status, failure, direction, attempt } = state
  const formRef = useRef(null)
  const questionRef = useRef(null)
  const successRef = useRef(null)
  const honeypotRef = useRef(null)
  const openedAt = useRef(null)
  const lastInput = useRef('pointer')
  const sending = useRef(false)
  const shownStep = useRef(step)
  const shownAttempt = useRef(attempt)

  // sessionStorage only exists in the browser: restore after hydration.
  useEffect(() => {
    const draft = loadDraft()
    if (draft) dispatch({ type: 'restore', draft })
  }, [])

  useEffect(() => {
    // EMPTY_BRIEF is the untouched initial object: never overwrite a stored draft with it.
    if (status === 'success' || data === EMPTY_BRIEF) return
    saveDraft(data)
  }, [data, status])

  useEffect(() => {
    if (shownStep.current === step) return
    shownStep.current = step
    questionRef.current?.focus()
  }, [step])

  useEffect(() => {
    if (shownAttempt.current === attempt) return
    shownAttempt.current = attempt
    formRef.current?.querySelector('[aria-invalid="true"]')?.focus()
  }, [attempt])

  useEffect(() => {
    if (status === 'success') successRef.current?.focus()
  }, [status])

  const markStart = () => {
    if (openedAt.current === null) openedAt.current = Date.now()
  }

  const submit = async () => {
    if (sending.current) return
    const result = validateBrief(data)
    if (!result.ok) {
      dispatch({ type: 'invalid', errors: result.errors })
      return
    }
    sending.current = true
    dispatch({ type: 'submitStart' })
    const response = await sendBrief({
      ...result.value,
      website: honeypotRef.current?.value ?? '',
      elapsedMs: Date.now() - (openedAt.current ?? Date.now()),
    })
    sending.current = false
    if (response.ok) {
      clearDraft()
      dispatch({ type: 'submitSuccess' })
    } else {
      dispatch({ type: 'submitFailure', kind: response.kind, fields: response.fields })
    }
  }

  const advance = () => {
    if (step < STEP_COUNT - 1) dispatch({ type: 'next', instant: lastInput.current === 'keyboard' })
    else submit()
  }

  const onKeyDown = (event) => {
    lastInput.current = 'keyboard'
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return
    const tag = event.target.tagName
    if (tag === 'TEXTAREA' || tag === 'BUTTON' || tag === 'A') return
    event.preventDefault()
    advance()
  }

  const change = (field) => (value) => dispatch({ type: 'change', field, value })
  const tags = BRIEF_TAGS[data.type] ?? []
  const hint = (briefTypes.find((type) => type.id === data.type) ?? briefTypes[briefTypes.length - 1]).hint
  const stepLabel = fill(t('briefStepOf'), { current: step + 1, total: STEP_COUNT })

  return (
    <section id="brief" className="section brief" aria-labelledby="brief-title">
      <div className="container brief-layout">
        <div className="brief-intro">
          <SectionHeading id="brief-title" eyebrow="05" title={t('ctaBrief')} />
          <p className="brief-lead">{t('briefIntro')}</p>
          <div className="brief-other">
            <p className="brief-other-title">{t('briefOther')}</p>
            <CopyEmailButton email={profile.email} />
            <ul className="brief-other-links">
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
          </div>
        </div>

        <div className="card brief-card">
          {status === 'success' ? (
            <BriefSuccess data={data} headingRef={successRef} lang={lang} />
          ) : (
            <form
              ref={formRef}
              className="brief-form"
              noValidate
              onSubmit={(event) => {
                event.preventDefault()
                advance()
              }}
              onKeyDown={onKeyDown}
              onPointerDownCapture={() => {
                lastInput.current = 'pointer'
                markStart()
              }}
              onFocusCapture={markStart}
            >
              <div className="brief-progress" aria-hidden="true">
                <span style={{ transform: `scaleX(${(step + 1) / STEP_COUNT})` }} />
              </div>
              <p className="brief-step-count mono" aria-hidden="true">
                {stepLabel}
              </p>
              <p className="sr-only" aria-live="polite">
                {`${stepLabel}: ${t(QUESTIONS[step])}`}
              </p>
              <div className="brief-honeypot" aria-hidden="true">
                <label>
                  {t('briefHoneypot')}
                  <input ref={honeypotRef} type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
                </label>
              </div>

              <fieldset key={step} className="brief-step" data-direction={direction} aria-labelledby="brief-question">
                <h3 id="brief-question" ref={questionRef} tabIndex={-1}>
                  {t(QUESTIONS[step])}
                </h3>

                {step === 0 && (
                  <>
                    <ChoiceGroup
                      name="type"
                      options={briefTypes}
                      value={data.type}
                      error={errors.type}
                      lang={lang}
                      onChange={change('type')}
                    />
                    <FieldError field="type" code={errors.type} />
                  </>
                )}

                {step === 1 && (
                  <>
                    <div className="brief-field">
                      <label htmlFor="brief-details">{t('briefDetailsLabel')}</label>
                      <p id="brief-details-hint" className="brief-hint">
                        {localize(hint, lang)}
                      </p>
                      <textarea
                        id="brief-details"
                        rows={6}
                        value={data.details}
                        onChange={(event) => change('details')(event.target.value)}
                        aria-invalid={errors.details ? 'true' : undefined}
                        aria-describedby={describedBy(
                          'brief-details-hint',
                          'brief-details-count',
                          errorId('details', errors.details),
                        )}
                      />
                      <p id="brief-details-count" className="brief-count mono">
                        {fill(t('briefCount'), { count: characterCount(data.details), max: LIMITS.detailsMax })}
                      </p>
                      <FieldError field="details" code={errors.details} />
                    </div>
                    {tags.length > 0 && (
                      <fieldset className="brief-tags">
                        <legend>{t('briefTagsLabel')}</legend>
                        <div className="brief-tag-list">
                          {tags.map((tag) => (
                            <label key={tag} className="brief-tag">
                              <input
                                type="checkbox"
                                checked={data.tags.includes(tag)}
                                onChange={() => dispatch({ type: 'toggleTag', tag })}
                              />
                              <span>{localize(briefTagLabels[tag], lang)}</span>
                            </label>
                          ))}
                        </div>
                      </fieldset>
                    )}
                  </>
                )}

                {step === 2 && (
                  <>
                    <ChoiceGroup
                      name="timeline"
                      options={briefTimelines}
                      value={data.timeline}
                      error={errors.timeline}
                      lang={lang}
                      onChange={change('timeline')}
                    />
                    <FieldError field="timeline" code={errors.timeline} />
                  </>
                )}

                {step === 3 && (
                  <>
                    <TextField
                      field="name"
                      label={t('briefName')}
                      autoComplete="name"
                      value={data.name}
                      error={errors.name}
                      onChange={change('name')}
                    />
                    <TextField
                      field="email"
                      label={t('briefEmail')}
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={data.email}
                      error={errors.email}
                      onChange={change('email')}
                    />
                    <TextField
                      field="phone"
                      label={t('briefPhone')}
                      type="tel"
                      autoComplete="tel"
                      value={data.phone}
                      error={errors.phone}
                      onChange={change('phone')}
                    />
                    <div className="brief-field">
                      <label className="brief-consent">
                        <input
                          type="checkbox"
                          checked={data.privacy}
                          onChange={(event) => change('privacy')(event.target.checked)}
                          aria-invalid={errors.privacy ? 'true' : undefined}
                          aria-describedby={errorId('privacy', errors.privacy)}
                        />
                        <span>
                          {t('briefPrivacyBefore')}
                          <a href="/privacidad" target="_blank" rel="noopener noreferrer">
                            {t('briefPrivacyLink')}
                          </a>
                          {t('briefPrivacyAfter')}
                        </span>
                      </label>
                      <FieldError field="privacy" code={errors.privacy} />
                    </div>
                  </>
                )}
              </fieldset>

              {failure && <BriefFailure kind={failure} sending={status === 'sending'} onRetry={submit} />}

              <div className="brief-actions">
                {step > 0 && (
                  <button
                    type="button"
                    className="btn"
                    onClick={(event) => dispatch({ type: 'back', instant: event.detail === 0 })}
                  >
                    <FiArrowLeft aria-hidden="true" />
                    {t('briefBack')}
                  </button>
                )}
                <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
                  {step < STEP_COUNT - 1 ? t('briefNext') : status === 'sending' ? t('briefSending') : t('briefSubmit')}
                  {step < STEP_COUNT - 1 && <FiArrowRight aria-hidden="true" />}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Estilos** — `src/components/css/Brief.css` (incluye las reglas de `CopyEmailButton` que vivían en `Contact.css`):

```css
.brief-layout {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: clamp(2rem, 5vw, 4rem);
  align-items: start;
}

.brief-lead {
  max-width: 40ch;
  margin-bottom: 2rem;
  color: var(--text-muted);
  font-size: 1.05rem;
}

.brief-other {
  display: grid;
  gap: 0.75rem;
  justify-items: start;
}

.brief-other-title {
  color: var(--text-muted);
  font: 500 0.8rem var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.brief-other-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.copy-email {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.copy-email-status {
  min-height: 1.5em;
  color: var(--success);
  font-size: 0.9rem;
}

.copy-email-status[data-status='failed'] {
  color: var(--text-muted);
}

.copy-email-status a {
  color: var(--accent);
  text-decoration: underline;
}

.brief-card {
  position: relative;
  padding: clamp(1.5rem, 3vw, 2.25rem);
  overflow: hidden;
}

.brief-form {
  display: grid;
  gap: 1.25rem;
}

.brief-progress {
  height: 2px;
  background: var(--border);
  overflow: hidden;
}

.brief-progress span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.6);
  transform-origin: left;
  transition: transform var(--dur-ui) var(--ease-out);
}

.brief-step-count {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.brief-honeypot {
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.brief-step {
  display: grid;
  gap: 1rem;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

.brief-step[data-direction='forward'] {
  animation: brief-in-right 250ms var(--ease-out) both;
}

.brief-step[data-direction='backward'] {
  animation: brief-in-left 250ms var(--ease-out) both;
}

.brief-step h3 {
  font-size: clamp(1.4rem, 2.6vw, 1.8rem);
  outline-offset: 6px;
}

.brief-choices {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.brief-choice,
.brief-tag {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-height: 56px;
  padding: 0.8rem 1rem;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  background: rgba(7, 8, 13, 0.4);
  cursor: pointer;
  transition:
    transform var(--dur-press) var(--ease-out),
    border-color var(--dur-ui) var(--ease-out),
    box-shadow var(--dur-ui) var(--ease-out),
    background-color var(--dur-ui) var(--ease-out);
}

.brief-tag {
  min-height: 44px;
  padding: 0.5rem 0.9rem;
  border-radius: 999px;
  font-size: 0.9rem;
}

.brief-choice:active,
.brief-tag:active {
  transform: scale(0.97);
}

.brief-choice input,
.brief-tag input,
.brief-consent input {
  width: 1.1rem;
  height: 1.1rem;
  accent-color: var(--accent);
}

.brief-choice:has(input:checked),
.brief-tag:has(input:checked) {
  border-color: var(--accent);
  background: rgba(0, 229, 255, 0.08);
  box-shadow: 0 0 22px rgba(0, 229, 255, 0.22);
}

.brief-choice:has(input:focus-visible),
.brief-tag:has(input:focus-visible) {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

@media (hover: hover) and (pointer: fine) {
  .brief-choice:hover,
  .brief-tag:hover {
    border-color: var(--accent);
  }
}

.brief-field {
  display: grid;
  gap: 0.4rem;
}

.brief-field label,
.brief-tags legend {
  font-weight: 600;
}

.brief-hint {
  color: var(--text-muted);
  font-size: 0.92rem;
}

.brief-field input[type='text'],
.brief-field input[type='email'],
.brief-field input[type='tel'],
.brief-field textarea {
  width: 100%;
  padding: 0.8rem 0.9rem;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  background: rgba(7, 8, 13, 0.6);
  color: var(--text);
  font: 400 1rem / 1.5 var(--font-body);
  transition:
    border-color var(--dur-ui) var(--ease-out),
    box-shadow var(--dur-ui) var(--ease-out);
}

.brief-field textarea {
  resize: vertical;
}

.brief-field input:focus-visible,
.brief-field textarea:focus-visible {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(0, 229, 255, 0.18);
  outline: none;
}

.brief-field [aria-invalid='true'] {
  border-color: #ff6b81;
}

.brief-count {
  justify-self: end;
  color: var(--text-muted);
  font-size: 0.75rem;
}

.brief-tags {
  display: grid;
  gap: 0.6rem;
  margin: 0;
  padding: 0;
  border: 0;
}

.brief-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.brief-consent {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  font-weight: 400 !important;
}

.brief-consent a {
  color: var(--accent);
  text-decoration: underline;
}

.brief-error {
  color: #ff8a9b;
  font-size: 0.9rem;
}

.brief-failure {
  display: grid;
  gap: 0.6rem;
  padding: 1rem;
  border: 1px solid rgba(255, 138, 155, 0.4);
  border-radius: var(--radius-sm);
  background: rgba(255, 107, 129, 0.06);
}

.brief-failure-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.brief-failure a {
  color: var(--accent);
  text-decoration: underline;
}

.brief-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.brief-success {
  position: relative;
  display: grid;
  gap: 1rem;
  justify-items: start;
}

/* One flash, once. */
.brief-success::before {
  content: '';
  position: absolute;
  inset: -40%;
  background: radial-gradient(circle at 20% 20%, rgba(0, 229, 255, 0.35), transparent 55%);
  opacity: 0;
  pointer-events: none;
  animation: brief-flash 700ms var(--ease-out) 1;
}

.brief-check {
  width: 52px;
  height: 52px;
  fill: none;
  stroke: var(--success);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  clip-path: inset(0 100% 0 0);
  animation: brief-draw 500ms var(--ease-out) 150ms forwards;
}

.brief-success h3 {
  font-size: clamp(1.4rem, 2.6vw, 1.9rem);
}

.brief-summary-title {
  color: var(--text-muted);
  font: 500 0.8rem var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.brief-summary {
  display: grid;
  gap: 0.75rem;
  width: 100%;
}

.brief-summary dt {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.brief-summary dd {
  margin: 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

@keyframes brief-in-right {
  from {
    opacity: 0;
    transform: translateX(24px);
  }
}

@keyframes brief-in-left {
  from {
    opacity: 0;
    transform: translateX(-24px);
  }
}

@keyframes brief-flash {
  30% {
    opacity: 1;
  }
}

@keyframes brief-draw {
  to {
    clip-path: inset(0 0 0 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .brief-check {
    clip-path: none;
  }
}

@media (max-width: 899px) {
  .brief-layout {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 479px) {
  .brief-choices {
    grid-template-columns: minmax(0, 1fr);
  }
}
```

- [ ] **Step 6: Home final y limpieza**
  - `src/routes/home.jsx`: sustituir `Contact` por `Brief` (import y uso). Orden final: `Hero`, `Services`, `Cases`, `Process`, `WhoAmI`, `Now`, `Brief`.

```bash
git rm src/components/Contact.jsx src/components/Contact.test.jsx src/components/css/Contact.css
```

- [ ] **Step 7: Tests, lint, build**

Run: `npm test && npm run lint && npm run build`
Expected: todo en verde.

- [ ] **Step 8: Comprobación visual y de teclado (juicio)**

`npm run dev`, 1440 y 375:
  - Tarjetas con `scale(0.97)` al pulsar y brillo cian al elegir; pasos que entran deslizándose en horizontal (~250 ms) al usar el ratón; sin deslizamiento cuando se avanza con Enter; barra de progreso neón; errores en rojo suave junto al campo, sin sacudidas.
  - Solo teclado: Tab hasta "Una web", Espacio, Enter → el foco pasa a "Cuéntame un poco más"; seguir hasta enviar. Con un lector de pantalla (NVDA o Narrador) se anuncia "Paso N de 4".
  - Sin `/api/brief` en `npm run dev` el envío falla: debe verse "No se ha podido enviar…", "Reintentar" y el email (prueba real del camino de error). El éxito se comprueba en el e2e de la Tarea 18.
  - Recargar a mitad: las respuestas vuelven (salvo la casilla de privacidad).

- [ ] **Step 9: Commit**

```bash
git add src/components/Brief.jsx src/components/Brief.test.jsx src/components/css/Brief.css src/routes/home.jsx src/routes/home.test.jsx src/i18n/strings.js
git commit -m "Add the guided project brief and finish the v2 home page

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 15: Páginas de caso con transición compartida

> **Tipo:** integración (rutas, prerender, transición de vista). Modelo capaz.

**Files:**
- Create: `src/routes/case.jsx`, `src/routes/case.test.jsx`, `src/components/CaseStudy.jsx`, `src/components/CaseStudy.test.jsx`, `src/components/css/CaseStudy.css`, `src/components/css/TechList.css`
- Modify: `src/routes.js`, `src/data/site.js`, `src/data/seo.js`, `src/styles/global.css`, `src/components/TechList.jsx`, `src/components/css/Cases.css`, `src/i18n/strings.js`

**Interfaces:**
- Consumes: `getCase`, `CASE_SLUGS` (Tarea 2), `ScreenPreview` (Tarea 3), `usePageScene` (Tarea 5), `TechList` (Tarea 8), `formatDate` (Tarea 10), `NotFound` (Tarea 1), `buildMeta` (Tarea 1).
- Produces:
  - Rutas `/casos/solarmetrics` y `/casos/seenat` (una entrada por slug con `id: 'case-<slug>'`, mismo módulo), prerenderizadas.
  - `PUBLIC_PATHS = ['/', '/casos/solarmetrics', '/casos/seenat']` (la Tarea 16 añade las legales).
  - `getPageSeo('/casos/<slug>')` → título `"<Nombre> · Caso de estudio · Miguel Ángel Domínguez"`, descripción `"<etiqueta>. <frase>"`.
  - `<CaseStudy item reducedMotion />`; su cabecera lleva `viewTransitionName: 'case-<slug>'`.

- [ ] **Step 1: Escribir los tests que fallan**

`src/components/CaseStudy.test.jsx`:

```jsx
import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CaseStudy from './CaseStudy'
import { getCase } from '../data/cases'
import { renderWithRouter } from '../test/router'

const h2s = () => screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)

describe('CaseStudy', () => {
  it('tells a finished project as challenge, build, decisions, result and what I would change', () => {
    renderWithRouter(<CaseStudy item={getCase('solarmetrics')} reducedMotion />)
    expect(screen.getByRole('heading', { level: 1, name: 'SolarMetrics' })).toBeInTheDocument()
    expect(screen.getByText('Herramienta a medida · Proyecto de fin de grado')).toBeInTheDocument()
    expect(h2s()).toEqual([
      'El reto',
      'Qué construí',
      'Decisiones clave',
      'Resultado',
      'Qué haría distinto',
      '¿Tienes algo parecido en mente?',
    ])
    const demo = screen.getByRole('link', { name: /Ver demo/ })
    expect(demo).toHaveAttribute('href', 'https://solarmetrics.vercel.app')
    expect(demo).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getByRole('link', { name: /Código/ })).toHaveAttribute('href', 'https://github.com/mdomgar/SolarMetrics')
    expect(screen.getByRole('img', { name: /panel de SolarMetrics/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Cuéntame tu proyecto' })).toHaveAttribute('href', '/#brief')
  })

  it('tells a project in progress with its privacy flow, real figures and development journal', () => {
    renderWithRouter(<CaseStudy item={getCase('seenat')} reducedMotion />)
    expect(h2s()).toEqual([
      'El reto',
      'Qué estoy construyendo',
      'Qué pasa con tu ubicación',
      'Decisiones clave',
      'Resultado hasta ahora',
      'Siguiente paso',
      'Diario de desarrollo',
      '¿Tienes algo parecido en mente?',
    ])
    expect(screen.queryByRole('link', { name: /Ver demo/ })).not.toBeInTheDocument()
    expect(screen.getByText('163')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
    const decisions = screen.getByRole('list', { name: 'Decisiones clave' })
    expect(within(decisions).getAllByRole('heading', { level: 3 })).toHaveLength(4)
    expect(screen.getByText('30 de septiembre de 2026')).toHaveAttribute('datetime', '2026-09-30')
  })

  it('shares its header name with the card on the home page', () => {
    renderWithRouter(<CaseStudy item={getCase('seenat')} reducedMotion />)
    expect(screen.getByRole('heading', { level: 1 }).closest('div').style.viewTransitionName).toBe('case-seenat')
  })
})
```

`src/routes/case.test.jsx`:

```jsx
import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import CasePage, { meta } from './case'
import { renderPage } from '../test/router'
import { useSceneStore } from '../store/sceneStore'

beforeEach(() => {
  useSceneStore.setState(useSceneStore.getInitialState(), true)
})

describe('case route', () => {
  it('renders the case for the current URL and dims the scene', async () => {
    renderPage(CasePage, { path: '/casos/seenat' })
    expect(await screen.findByRole('heading', { level: 1, name: 'Seenat' })).toBeInTheDocument()
    expect(useSceneStore.getState().section).toBe('case')
  })

  it('falls back to the not-found content for an unknown case', async () => {
    renderPage(CasePage, { path: '/casos/:slug', route: '/casos/nope' })
    expect(await screen.findByRole('heading', { level: 1, name: 'Esta página no existe' })).toBeInTheDocument()
  })

  it('declares the case SEO as an article', () => {
    const tags = meta({ location: { pathname: '/casos/solarmetrics' } })
    expect(tags[0].title).toBe('SolarMetrics · Caso de estudio · Miguel Ángel Domínguez')
    expect(tags.find((tag) => tag.property === 'og:type').content).toBe('article')
    expect(tags.find((tag) => tag.rel === 'canonical').href).toMatch(/\/casos\/solarmetrics$/)
  })
})
```

En `src/data/site.test.js` no hay que tocar nada: al añadir los casos a `PUBLIC_PATHS`, el test existente exige SEO válido para ellos.

- [ ] **Step 2: Ejecutar y verlos fallar**

Run: `npx vitest run src/components/CaseStudy.test.jsx src/routes/case.test.jsx`
Expected: FAIL — módulos inexistentes.

- [ ] **Step 3: Rutas, SEO y textos**

`src/data/site.js` (reemplazar entero):

```js
export const NOT_FOUND_PATH = '/404'

export const CASE_SLUGS = ['solarmetrics', 'seenat']

export const PUBLIC_PATHS = ['/', ...CASE_SLUGS.map((slug) => `/casos/${slug}`)]

export const PRERENDER_PATHS = [...PUBLIC_PATHS, NOT_FOUND_PATH]
```

`src/routes.js` (reemplazar entero):

```js
import { index, route } from '@react-router/dev/routes'
import { CASE_SLUGS } from './data/site.js'

export default [
  index('routes/home.jsx'),
  // One route per published case (same module, unique id) so unknown slugs fall through to the 404.
  ...CASE_SLUGS.map((slug) => route(`casos/${slug}`, 'routes/case.jsx', { id: `case-${slug}` })),
  route('*', 'routes/not-found.jsx'),
]
```

`src/data/seo.js`: añadir el import y la rama de casos (el resto del archivo no cambia):

```js
import { getCase } from './cases/index.js'
```

```js
const CASE_PATH = /^\/casos\/([a-z0-9-]+)$/
const CASE_STUDY = { es: 'Caso de estudio', en: 'Case study' }

function caseSeo(slug, lang) {
  const item = getCase(slug)
  if (!item) return null
  return {
    title: `${item.name} · ${localize(CASE_STUDY, lang)} · Miguel Ángel Domínguez`,
    description: `${localize(item.label, lang)}. ${localize(item.tagline, lang)}`,
    image: undefined,
    noindex: false,
  }
}
```

y al principio de `getPageSeo`:

```js
  const slug = CASE_PATH.exec(path)?.[1]
  if (slug) return caseSeo(slug, lang)
```

Añadir a `src/i18n/strings.js`:

```js
  caseDemo: { es: 'Ver demo', en: 'Live demo' },
  caseCode: { es: 'Código', en: 'Source code' },
  caseChallenge: { es: 'El reto', en: 'The challenge' },
  caseBuilt: { es: 'Qué construí', en: 'What I built' },
  caseBuilding: { es: 'Qué estoy construyendo', en: "What I'm building" },
  caseDecisions: { es: 'Decisiones clave', en: 'Key decisions' },
  caseResult: { es: 'Resultado', en: 'Result' },
  caseResultSoFar: { es: 'Resultado hasta ahora', en: 'Result so far' },
  caseNextDone: { es: 'Qué haría distinto', en: 'What I would do differently' },
  caseNextInProgress: { es: 'Siguiente paso', en: 'Next step' },
  caseJournal: { es: 'Diario de desarrollo', en: 'Development journal' },
  caseCtaTitle: { es: '¿Tienes algo parecido en mente?', en: 'Have something similar in mind?' },
```

- [ ] **Step 4: Componente y ruta**

`src/components/CaseStudy.jsx`:

```jsx
import { Link } from 'react-router'
import { FaGithub } from 'react-icons/fa'
import { FiExternalLink } from 'react-icons/fi'
import { localize } from '../data/localize'
import { useLang, useT } from '../i18n/useLang'
import { formatDate } from '../lib/format'
import ScreenPreview from './ScreenPreview'
import TechList from './TechList'
import './css/CaseStudy.css'

export default function CaseStudy({ item, reducedMotion }) {
  const lang = useLang()
  const t = useT()
  const done = item.status === 'done'

  return (
    <article className="case-page" aria-labelledby="case-title">
      <header className="container case-hero">
        <div className="case-hero-head" style={{ viewTransitionName: `case-${item.slug}` }}>
          <p className="case-page-label mono">{localize(item.label, lang)}</p>
          <h1 id="case-title">{item.name}</h1>
        </div>
        <p className="case-hero-tagline">{localize(item.tagline, lang)}</p>
        <TechList ids={item.stack} label={t('caseStack')} />
        {(item.links.demo || item.links.code) && (
          <div className="case-hero-links">
            {item.links.demo && (
              <a className="btn btn-primary" href={item.links.demo} target="_blank" rel="noopener noreferrer">
                <FiExternalLink aria-hidden="true" />
                {t('caseDemo')}
                <span className="sr-only"> · {item.name}</span>
              </a>
            )}
            {item.links.code && (
              <a className="btn" href={item.links.code} target="_blank" rel="noopener noreferrer">
                <FaGithub aria-hidden="true" />
                {t('caseCode')}
                <span className="sr-only"> · {item.name}</span>
              </a>
            )}
          </div>
        )}
      </header>

      <div className="container case-body">
        <figure className={`case-figure case-figure--${item.preview}`}>
          <ScreenPreview screen={item.preview} reducedMotion={reducedMotion} />
        </figure>

        <section className="case-section" aria-labelledby="case-challenge">
          <h2 id="case-challenge">{t('caseChallenge')}</h2>
          <p>{localize(item.challenge, lang)}</p>
        </section>

        <section className="case-section" aria-labelledby="case-built">
          <h2 id="case-built">{t(done ? 'caseBuilt' : 'caseBuilding')}</h2>
          <ul className="case-built">
            {localize(item.built, lang).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>

        {item.flow && (
          <section className="case-section" aria-labelledby="case-flow">
            <h2 id="case-flow">{localize(item.flow.title, lang)}</h2>
            <ol className="case-flow">
              {item.flow.steps.map((step) => (
                <li key={step.title.es}>
                  <h3>{localize(step.title, lang)}</h3>
                  <p>{localize(step.text, lang)}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        <section className="case-section" aria-labelledby="case-decisions">
          <h2 id="case-decisions">{t('caseDecisions')}</h2>
          <ol className="case-decisions" aria-labelledby="case-decisions">
            {item.decisions.map((decision) => (
              <li key={decision.title.es}>
                <h3>{localize(decision.title, lang)}</h3>
                <p>{localize(decision.why, lang)}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="case-section" aria-labelledby="case-result">
          <h2 id="case-result">{t(done ? 'caseResult' : 'caseResultSoFar')}</h2>
          {item.stats.length > 0 && (
            <ul className="case-page-stats">
              {item.stats.map((stat) => (
                <li key={stat.id}>
                  <span className="case-page-stat-value">{stat.value}</span>{' '}
                  <span>{localize(stat.label, lang)}</span>
                </li>
              ))}
            </ul>
          )}
          <p>{localize(item.result, lang)}</p>
        </section>

        <section className="case-section" aria-labelledby="case-next">
          <h2 id="case-next">{t(done ? 'caseNextDone' : 'caseNextInProgress')}</h2>
          <p>{localize(item.next, lang)}</p>
        </section>

        {item.journal && (
          <section className="case-section" aria-labelledby="case-journal">
            <h2 id="case-journal">{t('caseJournal')}</h2>
            <ol className="case-journal">
              {item.journal.map((entry) => (
                <li key={entry.date}>
                  <time dateTime={entry.date}>{formatDate(entry.date, lang)}</time>
                  <p>{localize(entry.text, lang)}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        <aside className="card case-cta" aria-labelledby="case-cta-title">
          <h2 id="case-cta-title">{t('caseCtaTitle')}</h2>
          <Link className="btn btn-primary" to="/#brief">
            {t('ctaBrief')}
          </Link>
        </aside>
      </div>
    </article>
  )
}
```

`src/routes/case.jsx`:

```jsx
import { useLocation, useOutletContext } from 'react-router'
import CaseStudy from '../components/CaseStudy'
import NotFound from './not-found'
import { getCase } from '../data/cases'
import { getPageSeo } from '../data/seo'
import { usePageScene } from '../hooks/usePageScene'
import { buildMeta } from '../lib/seo'

export const meta = ({ location }) => {
  const path = location.pathname.replace(/\/+$/, '')
  const seo = getPageSeo(path)
  return seo ? buildMeta({ path, ...seo, type: 'article' }) : []
}

export default function CasePage() {
  const { pathname } = useLocation()
  const { reducedMotion } = useOutletContext()
  usePageScene('case')
  const item = getCase(pathname.split('/').filter(Boolean).pop())
  if (!item) return <NotFound />
  return <CaseStudy item={item} reducedMotion={reducedMotion} />
}
```

Nota: `buildMeta` recibe `image: undefined` desde `getPageSeo` y usa su valor por defecto (`/img/og-image.jpg`) hasta que la Tarea 17 genera las imágenes por caso.

- [ ] **Step 5: Estilos y transición compartida**

`src/components/css/TechList.css` (mover aquí la regla `.tech-list` de `Cases.css` y borrarla de allí):

```css
.tech-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
```

En `src/components/TechList.jsx` añadir `import './css/TechList.css'` debajo del import de `TECH`.

`src/components/css/CaseStudy.css`:

```css
.case-page {
  padding-top: calc(var(--nav-h) + clamp(2.5rem, 8vh, 5rem));
  padding-bottom: clamp(4rem, 10vh, 6rem);
}

.case-hero {
  display: grid;
  gap: 1.1rem;
  justify-items: start;
  margin-bottom: clamp(2.5rem, 7vh, 4rem);
}

.case-page-label {
  color: var(--accent);
  font-size: 0.85rem;
}

.case-hero h1 {
  margin-top: 0.4rem;
  font-size: clamp(3rem, 9vw, 6rem);
  letter-spacing: -0.03em;
}

.case-hero-tagline {
  max-width: 40ch;
  font-size: clamp(1.15rem, 2vw, 1.4rem);
}

.case-hero-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.case-body {
  display: grid;
  gap: clamp(2.5rem, 6vh, 3.5rem);
  max-width: 820px;
}

.case-figure {
  margin: 0;
}

.case-section h2 {
  margin-bottom: 0.9rem;
  font-size: clamp(1.6rem, 3vw, 2.2rem);
}

.case-section p,
.case-section li {
  color: var(--text-muted);
}

.case-built {
  display: grid;
  gap: 0.6rem;
}

.case-built li {
  padding-left: 1.2rem;
  position: relative;
}

.case-built li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.65em;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
}

.case-flow {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  counter-reset: flow;
}

.case-flow li {
  position: relative;
  padding: 1.1rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: rgba(19, 23, 34, 0.6);
}

.case-flow li:not(:last-child)::after {
  content: '→';
  position: absolute;
  right: -0.85rem;
  top: 50%;
  translate: 0 -50%;
  color: var(--accent);
}

.case-flow h3,
.case-decisions h3 {
  margin-bottom: 0.35rem;
  color: var(--text);
  font-size: 1.1rem;
}

.case-decisions {
  display: grid;
  gap: 1.25rem;
}

.case-decisions li {
  padding-left: 1rem;
  border-left: 2px solid var(--accent-2);
}

.case-page-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 2.5rem;
  margin-bottom: 1rem;
}

.case-page-stats li {
  display: grid;
}

.case-page-stat-value {
  color: var(--accent);
  font: 600 clamp(2.2rem, 5vw, 3.2rem) / 1 var(--font-display);
  text-shadow: 0 0 18px rgba(0, 229, 255, 0.35);
}

.case-journal {
  display: grid;
  gap: 1rem;
}

.case-journal time {
  display: block;
  color: var(--accent);
  font: 500 0.85rem var(--font-mono);
}

.case-cta {
  display: grid;
  gap: 1rem;
  justify-items: start;
  padding: clamp(1.5rem, 3vw, 2.25rem);
}

.case-cta h2 {
  font-size: clamp(1.5rem, 3vw, 2rem);
}

@media (max-width: 767px) {
  .case-flow {
    grid-template-columns: minmax(0, 1fr);
  }

  .case-flow li:not(:last-child)::after {
    content: '↓';
    right: auto;
    left: 50%;
    top: auto;
    bottom: -1.1rem;
    translate: -50% 0;
  }
}
```

`src/styles/global.css`: añadir al final (antes del bloque de reduced motion):

```css
/* Card → case page shared transition (React Router <Link viewTransition>). */
::view-transition-group(*) {
  animation-duration: var(--dur-panel);
  animation-timing-function: var(--ease-in-out);
}

@media (prefers-reduced-motion: reduce) {
  /* Cross-fade only: the named header snaps to its new place instead of flying. */
  ::view-transition-group(*) {
    animation: none;
  }
}
```

- [ ] **Step 6: Tests, lint, build y prerender**

Run: `npm test && npm run lint && npm run build`
Expected: todo en verde; el build lista `Prerender (html): /casos/solarmetrics -> build/client/casos/solarmetrics/index.html` y lo mismo para `seenat`.

```bash
grep -c '<title>Seenat · Caso de estudio · Miguel Ángel Domínguez</title>' build/client/casos/seenat/index.html
grep -c 'Diario de desarrollo' build/client/casos/seenat/index.html
npm run preview &
sleep 1
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:4173/casos/seenat
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:4173/casos/no-existe
kill %1
```

Expected: `1`, `1`, `200`, `404`.

- [ ] **Step 7: Comprobación visual (juicio)**

`npm run dev` en Chrome: desde la home, pulsar la tarjeta de Seenat → la cabecera de la tarjeta viaja hasta la cabecera del caso (~400 ms) y el resto funde; la escena se atenúa. Volver con la navbar ("Casos") lleva a `/#casos`. Con reduced motion: solo fundido. Revisar ambos casos a 1440, 768 y 375 (flujo de privacidad en tres cajas con flechas; en móvil, apiladas).

- [ ] **Step 8: Commit**

```bash
git add src/routes.js src/routes/case.jsx src/routes/case.test.jsx src/components/CaseStudy.jsx src/components/CaseStudy.test.jsx src/components/css/CaseStudy.css src/components/css/TechList.css src/components/TechList.jsx src/components/css/Cases.css src/data/site.js src/data/seo.js src/styles/global.css src/i18n/strings.js
git commit -m "Add prerendered case study pages with a shared card transition

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---
### Task 16: Páginas legales (privacidad y aviso legal)

> **Tipo:** transcripción (texto base; Miguel debe revisarlo antes de publicar). Modelo económico.

**Files:**
- Create: `src/data/legal.js`, `src/data/legal.test.js`, `src/components/LegalPage.jsx`, `src/components/OwnerDetails.jsx`, `src/components/OwnerDetails.test.jsx`, `src/routes/privacy.jsx`, `src/routes/legal.jsx`, `src/routes/legal-pages.test.jsx`
- Modify: `src/data/profile.js`, `src/data/site.js`, `src/data/seo.js`, `src/routes.js`, `src/styles/pages.css`, `src/i18n/strings.js`

**Interfaces:**
- Consumes: `fill`, `formatDate` (Tarea 10), `usePageScene` (Tarea 5), `buildMeta`, `getPageSeo` (Tarea 1), `renderPage`.
- Produces:
  - `profile.legal = { holder, nif: string|null, address: Localized }`.
  - `legalPages.privacy` / `legalPages.legal`: `{ path, updated, title, intro, sections: Array<{ id, title, body: { es: string[], en: string[] }, owner?: true }> }`; los párrafos admiten `{holder}`, `{address}`, `{email}`.
  - `LEGAL_PATHS = ['/privacidad', '/aviso-legal']` incluidas en `PUBLIC_PATHS`.
  - `<LegalPage page />`, `<OwnerDetails legal />` (la fila NIF solo aparece si `legal.nif`).
  - Strings `legalHolder`, `legalNif`, `legalAddress`, `legalEmail`, `legalUpdated`.

- [ ] **Step 1: Escribir los tests que fallan**

`src/data/legal.test.js`:

```js
import { describe, expect, it } from 'vitest'
import { legalPages } from './legal'

const filled = (value) => typeof value === 'string' && value.trim() !== ''

describe('legal pages', () => {
  it('have every heading and paragraph in both languages', () => {
    for (const page of Object.values(legalPages)) {
      expect(filled(page.title.es) && filled(page.title.en), page.path).toBe(true)
      expect(filled(page.intro.es) && filled(page.intro.en), page.path).toBe(true)
      expect(page.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      for (const section of page.sections) {
        expect(filled(section.title.es) && filled(section.title.en), section.id).toBe(true)
        expect(section.body.es.length, section.id).toBe(section.body.en.length)
        expect(section.body.es.every(filled) && section.body.en.every(filled), section.id).toBe(true)
      }
    }
  })

  it('cover what the spec asks the privacy policy to say', () => {
    const text = legalPages.privacy.sections.flatMap((section) => section.body.es).join(' ')
    for (const fragment of ['responderte', 'consentimiento', '12 meses', 'Resend', 'encargado', 'aepd.es', '{email}']) {
      expect(text, fragment).toContain(fragment)
    }
  })
})
```

`src/components/OwnerDetails.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import OwnerDetails from './OwnerDetails'
import { profile } from '../data/profile'

describe('OwnerDetails', () => {
  it('lists the owner, address and contact, leaving out a missing NIF', () => {
    render(<OwnerDetails legal={profile.legal} />)
    expect(screen.getByText('Miguel Ángel Domínguez García')).toBeInTheDocument()
    expect(screen.getByText('Jaén, España')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: profile.email })).toHaveAttribute('href', `mailto:${profile.email}`)
    expect(screen.queryByText('NIF')).not.toBeInTheDocument()
  })

  it('shows the NIF once it is filled in', () => {
    render(<OwnerDetails legal={{ ...profile.legal, nif: '00000000T' }} />)
    expect(screen.getByText('NIF')).toBeInTheDocument()
    expect(screen.getByText('00000000T')).toBeInTheDocument()
  })
})
```

`src/routes/legal-pages.test.jsx`:

```jsx
import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import Privacy, { meta as privacyMeta } from './privacy'
import Legal, { meta as legalMeta } from './legal'
import { renderPage } from '../test/router'
import { useSceneStore } from '../store/sceneStore'

beforeEach(() => {
  useSceneStore.setState(useSceneStore.getInitialState(), true)
})

describe('legal routes', () => {
  it('renders the privacy policy with the contact email filled in', async () => {
    renderPage(Privacy, { path: '/privacidad' })
    expect(await screen.findByRole('heading', { level: 1, name: 'Política de privacidad' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Tus derechos' })).toBeInTheDocument()
    expect(screen.getAllByText(/miguelangelespeluy@gmail\.com/).length).toBeGreaterThan(0)
    expect(document.body).not.toHaveTextContent('{email}')
    expect(useSceneStore.getState().section).toBe('case')
    expect(privacyMeta()[0].title).toBe('Privacidad · Miguel Ángel Domínguez')
  })

  it('renders the legal notice with the owner details', async () => {
    renderPage(Legal, { path: '/aviso-legal' })
    expect(await screen.findByRole('heading', { level: 1, name: 'Aviso legal' })).toBeInTheDocument()
    expect(screen.getByText('Titular', { selector: 'dt' })).toBeInTheDocument()
    expect(legalMeta()[0].title).toBe('Aviso legal · Miguel Ángel Domínguez')
  })
})
```

- [ ] **Step 2: Ejecutar y verlos fallar**

Run: `npx vitest run src/data/legal.test.js src/components/OwnerDetails.test.jsx src/routes/legal-pages.test.jsx`
Expected: FAIL — módulos inexistentes.

- [ ] **Step 3: Datos legales** — en `src/data/profile.js` añadir dentro de `profile`:

```js
  // LSSI requires the NIF and a postal address: Miguel fills them in before publishing.
  legal: {
    holder: 'Miguel Ángel Domínguez García',
    nif: null,
    address: { es: 'Jaén, España', en: 'Jaén, Spain' },
  },
```

`src/data/legal.js`:

```js
// Base text for phase A (spec §9). Miguel must review it before publishing.
export const legalPages = {
  privacy: {
    path: '/privacidad',
    updated: '2026-10-01',
    title: { es: 'Política de privacidad', en: 'Privacy policy' },
    intro: {
      es: 'Qué hago con los datos que me envías desde el formulario «Cuéntame tu proyecto».',
      en: 'What I do with the data you send me through the "Tell me about your project" form.',
    },
    sections: [
      {
        id: 'controller',
        title: { es: 'Responsable', en: 'Data controller' },
        body: {
          es: ['{holder}, {address}. Puedes escribirme a {email}.'],
          en: ['{holder}, {address}. You can write to me at {email}.'],
        },
      },
      {
        id: 'data',
        title: { es: 'Qué datos trato', en: 'What data I process' },
        body: {
          es: [
            'Los que escribes en el formulario: qué quieres construir, la descripción, las etiquetas que marques, el plazo, tu nombre, tu email y, si lo das, tu teléfono.',
          ],
          en: [
            'What you type in the form: what you want to build, the description, the tags you tick, the timeline, your name, your email and, if you give it, your phone number.',
          ],
        },
      },
      {
        id: 'purpose',
        title: { es: 'Para qué', en: 'Purpose' },
        body: {
          es: ['Solo para leer tu proyecto y responderte. No los uso para publicidad ni se los cedo a nadie para sus propios fines.'],
          en: ['Only to read about your project and reply to you. I do not use them for advertising or hand them to anyone for their own purposes.'],
        },
      },
      {
        id: 'basis',
        title: { es: 'Base legal', en: 'Legal basis' },
        body: {
          es: ['Tu consentimiento, que das al marcar la casilla antes de enviar el formulario. Puedes retirarlo cuando quieras escribiéndome.'],
          en: ['Your consent, which you give by ticking the box before sending the form. You can withdraw it at any time by writing to me.'],
        },
      },
      {
        id: 'retention',
        title: { es: 'Cuánto tiempo los guardo', en: 'How long I keep them' },
        body: {
          es: ['12 meses desde nuestro último contacto. Si acabamos trabajando juntos, conservaré lo necesario para el contrato durante los plazos que exija la ley.'],
          en: ['12 months from our last contact. If we end up working together, I will keep what the contract needs for as long as the law requires.'],
        },
      },
      {
        id: 'recipients',
        title: { es: 'Quién más los trata', en: 'Who else processes them' },
        body: {
          es: [
            'Resend, que me hace llegar por correo el contenido del formulario, como encargado del tratamiento.',
            'Vercel, que aloja esta web y ejecuta el envío del formulario.',
            'Ambas empresas están en Estados Unidos y tratan los datos con las garantías que exige el RGPD para las transferencias internacionales (cláusulas contractuales tipo o Marco de Privacidad de Datos UE-EE. UU.).',
          ],
          en: [
            'Resend, which delivers the content of the form to my inbox, as data processor.',
            'Vercel, which hosts this website and runs the form submission.',
            'Both companies are based in the United States and process the data with the safeguards the GDPR requires for international transfers (standard contractual clauses or the EU-US Data Privacy Framework).',
          ],
        },
      },
      {
        id: 'rights',
        title: { es: 'Tus derechos', en: 'Your rights' },
        body: {
          es: [
            'Puedes pedirme el acceso, la rectificación, la supresión, la oposición, la limitación o la portabilidad de tus datos escribiendo a {email}.',
            'Si crees que no los he tratado bien, puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).',
          ],
          en: [
            'You can ask me for access, rectification, erasure, objection, restriction or portability of your data by writing to {email}.',
            'If you think I have not handled them properly, you can complain to the Spanish Data Protection Agency (aepd.es).',
          ],
        },
      },
      {
        id: 'storage',
        title: { es: 'Cookies y almacenamiento', en: 'Cookies and storage' },
        body: {
          es: [
            'Esta web no usa cookies ni analítica. Tu navegador guarda en sessionStorage el borrador del formulario y si ya has visto la animación de inicio; se borra al cerrar la pestaña y nunca sale de tu dispositivo.',
          ],
          en: [
            'This website uses no cookies and no analytics. Your browser keeps the form draft, and whether you have already seen the intro animation, in sessionStorage; it is deleted when you close the tab and never leaves your device.',
          ],
        },
      },
    ],
  },
  legal: {
    path: '/aviso-legal',
    updated: '2026-10-01',
    title: { es: 'Aviso legal', en: 'Legal notice' },
    intro: {
      es: 'Datos del titular y condiciones de uso de esta web, según la Ley 34/2002 de servicios de la sociedad de la información (LSSI).',
      en: 'Owner details and terms of use of this website, under Spanish Law 34/2002 on information society services (LSSI).',
    },
    sections: [
      {
        id: 'owner',
        owner: true,
        title: { es: 'Titular', en: 'Owner' },
        body: { es: ['Esta web pertenece a:'], en: ['This website belongs to:'] },
      },
      {
        id: 'purpose',
        title: { es: 'Objeto', en: 'Purpose' },
        body: {
          es: ['Esta web presenta mis servicios de desarrollo web y mis proyectos, y permite contactar conmigo.'],
          en: ['This website presents my web development services and my projects, and lets you contact me.'],
        },
      },
      {
        id: 'use',
        title: { es: 'Condiciones de uso', en: 'Terms of use' },
        body: {
          es: ['Al navegar por la web aceptas usarla de buena fe. El contenido es informativo y puede cambiar sin previo aviso.'],
          en: ['By browsing this website you agree to use it in good faith. The content is informative and may change without notice.'],
        },
      },
      {
        id: 'ip',
        title: { es: 'Propiedad intelectual', en: 'Intellectual property' },
        body: {
          es: ['Los textos, el diseño, el código y las imágenes de esta web son míos salvo que se indique lo contrario. Las marcas y logotipos de terceros pertenecen a sus titulares.'],
          en: ['The texts, design, code and images of this website are mine unless stated otherwise. Third-party trademarks and logos belong to their owners.'],
        },
      },
      {
        id: 'links',
        title: { es: 'Enlaces externos', en: 'External links' },
        body: {
          es: ['Los enlaces a otras webs (GitHub, LinkedIn, demos) llevan a sitios que no controlo; no me hago responsable de su contenido.'],
          en: ['Links to other websites (GitHub, LinkedIn, demos) lead to sites I do not control; I am not responsible for their content.'],
        },
      },
      {
        id: 'law',
        title: { es: 'Legislación aplicable', en: 'Applicable law' },
        body: { es: ['Se aplica la legislación española.'], en: ['Spanish law applies.'] },
      },
    ],
  },
}
```

- [ ] **Step 4: Rutas, SEO y textos**

`src/data/site.js` (reemplazar entero):

```js
export const NOT_FOUND_PATH = '/404'

export const CASE_SLUGS = ['solarmetrics', 'seenat']

export const LEGAL_PATHS = ['/privacidad', '/aviso-legal']

export const PUBLIC_PATHS = ['/', ...CASE_SLUGS.map((slug) => `/casos/${slug}`), ...LEGAL_PATHS]

export const PRERENDER_PATHS = [...PUBLIC_PATHS, NOT_FOUND_PATH]
```

`src/data/seo.js`: añadir a `PAGES`:

```js
  '/privacidad': {
    title: { es: 'Privacidad · Miguel Ángel Domínguez', en: 'Privacy · Miguel Ángel Domínguez' },
    description: {
      es: 'Qué datos trato cuando me envías tu proyecto desde el formulario, para qué, cuánto tiempo y cómo ejercer tus derechos.',
      en: 'What data I process when you send me your project through the form, why, for how long and how to exercise your rights.',
    },
  },
  '/aviso-legal': {
    title: { es: 'Aviso legal · Miguel Ángel Domínguez', en: 'Legal notice · Miguel Ángel Domínguez' },
    description: {
      es: 'Titular, condiciones de uso, propiedad intelectual y legislación aplicable de la web de Miguel Ángel Domínguez García.',
      en: 'Owner, terms of use, intellectual property and applicable law of the website of Miguel Ángel Domínguez García.',
    },
  },
```

`src/routes.js`: añadir antes de la ruta `*`:

```js
  route('privacidad', 'routes/privacy.jsx'),
  route('aviso-legal', 'routes/legal.jsx'),
```

Añadir a `src/i18n/strings.js`:

```js
  legalHolder: { es: 'Titular', en: 'Owner' },
  legalNif: { es: 'NIF', en: 'Tax ID (NIF)' },
  legalAddress: { es: 'Domicilio', en: 'Address' },
  legalEmail: { es: 'Email de contacto', en: 'Contact email' },
  legalUpdated: { es: 'Última actualización:', en: 'Last updated:' },
```

- [ ] **Step 5: Componentes y rutas**

`src/components/OwnerDetails.jsx`:

```jsx
import { profile } from '../data/profile'
import { localize } from '../data/localize'
import { useLang, useT } from '../i18n/useLang'

export default function OwnerDetails({ legal }) {
  const lang = useLang()
  const t = useT()
  return (
    <dl className="legal-owner">
      <div>
        <dt>{t('legalHolder')}</dt>
        <dd>{legal.holder}</dd>
      </div>
      {legal.nif && (
        <div>
          <dt>{t('legalNif')}</dt>
          <dd>{legal.nif}</dd>
        </div>
      )}
      <div>
        <dt>{t('legalAddress')}</dt>
        <dd>{localize(legal.address, lang)}</dd>
      </div>
      <div>
        <dt>{t('legalEmail')}</dt>
        <dd>
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
        </dd>
      </div>
    </dl>
  )
}
```

`src/components/LegalPage.jsx`:

```jsx
import { profile } from '../data/profile'
import { localize } from '../data/localize'
import { useLang, useT } from '../i18n/useLang'
import { fill, formatDate } from '../lib/format'
import OwnerDetails from './OwnerDetails'

export default function LegalPage({ page }) {
  const lang = useLang()
  const t = useT()
  const values = { holder: profile.legal.holder, address: localize(profile.legal.address, lang), email: profile.email }

  return (
    <article className="section page-simple legal-page" aria-labelledby="legal-title">
      <div className="container legal-body">
        <h1 id="legal-title">{localize(page.title, lang)}</h1>
        <p className="legal-intro">{localize(page.intro, lang)}</p>
        {page.sections.map((section) => (
          <section key={section.id} aria-labelledby={`legal-${section.id}`}>
            <h2 id={`legal-${section.id}`}>{localize(section.title, lang)}</h2>
            {localize(section.body, lang).map((paragraph) => (
              <p key={paragraph}>{fill(paragraph, values)}</p>
            ))}
            {section.owner && <OwnerDetails legal={profile.legal} />}
          </section>
        ))}
        <p className="legal-updated mono">
          {t('legalUpdated')} <time dateTime={page.updated}>{formatDate(page.updated, lang)}</time>
        </p>
      </div>
    </article>
  )
}
```

`src/routes/privacy.jsx`:

```jsx
import LegalPage from '../components/LegalPage'
import { legalPages } from '../data/legal'
import { getPageSeo } from '../data/seo'
import { usePageScene } from '../hooks/usePageScene'
import { buildMeta } from '../lib/seo'

const PATH = '/privacidad'

export const meta = () => buildMeta({ path: PATH, ...getPageSeo(PATH) })

export default function Privacy() {
  usePageScene('case')
  return <LegalPage page={legalPages.privacy} />
}
```

`src/routes/legal.jsx`:

```jsx
import LegalPage from '../components/LegalPage'
import { legalPages } from '../data/legal'
import { getPageSeo } from '../data/seo'
import { usePageScene } from '../hooks/usePageScene'
import { buildMeta } from '../lib/seo'

const PATH = '/aviso-legal'

export const meta = () => buildMeta({ path: PATH, ...getPageSeo(PATH) })

export default function Legal() {
  usePageScene('case')
  return <LegalPage page={legalPages.legal} />
}
```

Añadir a `src/styles/pages.css`:

```css
.legal-body {
  display: grid;
  gap: 1.75rem;
  max-width: 760px;
}

.legal-body h2 {
  margin-bottom: 0.6rem;
  font-size: clamp(1.3rem, 2.4vw, 1.6rem);
}

.legal-body section p {
  margin-bottom: 0.6rem;
  color: var(--text-muted);
}

.legal-owner {
  display: grid;
  gap: 0.5rem;
}

.legal-owner div {
  display: grid;
  grid-template-columns: 11rem minmax(0, 1fr);
  gap: 1rem;
}

.legal-owner dt {
  color: var(--text-muted);
}

.legal-owner a {
  color: var(--accent);
  text-decoration: underline;
}

.legal-updated {
  color: var(--text-muted);
  font-size: 0.8rem;
}

@media (max-width: 479px) {
  .legal-owner div {
    grid-template-columns: minmax(0, 1fr);
    gap: 0.1rem;
  }
}
```

- [ ] **Step 6: Tests, lint, build**

Run: `npm test && npm run lint && npm run build`
Expected: todo en verde; el build prerenderiza `/privacidad` y `/aviso-legal`.

- [ ] **Step 7: Commit**

```bash
git add src/data/legal.js src/data/legal.test.js src/components/LegalPage.jsx src/components/OwnerDetails.jsx src/components/OwnerDetails.test.jsx src/routes/privacy.jsx src/routes/legal.jsx src/routes/legal-pages.test.jsx src/data/profile.js src/data/site.js src/data/seo.js src/routes.js src/styles/pages.css src/i18n/strings.js
git commit -m "Add the privacy policy and legal notice pages

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 17: SEO completo — JSON-LD, sitemap, robots e imágenes OG por caso

> **Tipo:** integración (hook de build, script con Chrome del sistema). Modelo capaz.

**Files:**
- Create: `src/lib/sitemap.js`, `src/lib/sitemap.test.js`, `scripts/og-images.js`, `public/img/og-solarmetrics.jpg`, `public/img/og-seenat.jpg` (generadas)
- Modify: `src/lib/seo.js`, `src/lib/seo.test.js`, `src/routes/home.jsx`, `src/data/seo.js`, `react-router.config.js`, `package.json`, `package-lock.json`
- Delete: `public/robots.txt`

**Interfaces:**
- Consumes: `PUBLIC_PATHS`, `NOT_FOUND_PATH` (Tareas 1/15/16), `cases`, `profile`, `services`, `escapeHtml`.
- Produces:
  - `buildSitemap(siteUrl, paths) → string` (XML), `buildRobots(siteUrl) → string` en `src/lib/sitemap.js` (imports con extensión `.js`: lo carga `react-router.config.js`).
  - `buildJsonLd() → { '@context', '@graph': [Person, ProfessionalService] }` en `src/lib/seo.js`; la home lo emite con el descriptor `{ 'script:ld+json': ... }`.
  - `getPageSeo('/casos/<slug>').image = '/img/og-<slug>.jpg'`.
  - Build: `build/client/sitemap.xml`, `build/client/robots.txt`, `build/client/404.html`.
  - Script npm `og:images` = `node scripts/og-images.js`; dependencia de desarrollo `@playwright/test` (sin descargar navegadores).

- [ ] **Step 1: Instalar Playwright sin navegadores**

```bash
npm install -D @playwright/test@^1.63.0
```

Expected: se instala el paquete; **no** se ejecuta `npx playwright install` (se usa el Chrome del sistema con `channel: 'chrome'`).

- [ ] **Step 2: Escribir los tests que fallan**

`src/lib/sitemap.test.js`:

```js
import { describe, expect, it } from 'vitest'
import { buildRobots, buildSitemap } from './sitemap'

describe('buildSitemap', () => {
  it('lists every public URL under the site domain', () => {
    const xml = buildSitemap('https://example.dev/', ['/', '/casos/seenat'])
    expect(xml).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>/)
    expect(xml).toContain('<loc>https://example.dev/</loc>')
    expect(xml).toContain('<loc>https://example.dev/casos/seenat</loc>')
    expect(xml.match(/<url>/g)).toHaveLength(2)
  })
})

describe('buildRobots', () => {
  it('allows everything and points to the sitemap', () => {
    expect(buildRobots('https://example.dev')).toBe('User-agent: *\nAllow: /\n\nSitemap: https://example.dev/sitemap.xml\n')
  })
})
```

En `src/lib/seo.test.js` añadir (y ampliar el import a `import { absoluteUrl, buildJsonLd, buildMeta, SITE_URL } from './seo'`, más `import { getPageSeo } from '../data/seo'`):

```js
describe('buildJsonLd', () => {
  it('describes me as a person offering a professional service', () => {
    const { '@context': context, '@graph': graph } = buildJsonLd()
    expect(context).toBe('https://schema.org')
    const person = graph.find((node) => node['@type'] === 'Person')
    const service = graph.find((node) => node['@type'] === 'ProfessionalService')
    expect(person).toMatchObject({ name: 'Miguel Ángel Domínguez García', url: `${SITE_URL}/` })
    expect(person.sameAs).toEqual(['https://github.com/mdomgar', expect.stringContaining('linkedin.com')])
    expect(service.founder).toEqual({ '@id': person['@id'] })
    expect(service.hasOfferCatalog.itemListElement.map((offer) => offer.itemOffered.name)).toEqual([
      'Tu web',
      'Tu herramienta',
      'Tu app',
    ])
  })
})

describe('case social images', () => {
  it('uses a dedicated image per case', () => {
    expect(getPageSeo('/casos/seenat').image).toBe('/img/og-seenat.jpg')
  })
})
```

En `src/routes/home.test.jsx`, en el test `'declares its SEO tags'`, añadir:

```jsx
    const jsonLd = tags.find((tag) => 'script:ld+json' in tag)['script:ld+json']
    expect(jsonLd['@graph'].map((node) => node['@type'])).toEqual(['Person', 'ProfessionalService'])
```

- [ ] **Step 3: Ejecutar y verlos fallar**

Run: `npx vitest run src/lib/sitemap.test.js src/lib/seo.test.js src/routes/home.test.jsx`
Expected: FAIL — `./sitemap` no existe, `buildJsonLd is not a function`, imagen de caso `undefined`.

- [ ] **Step 4: Implementación**

`src/lib/sitemap.js`:

```js
import { normalizeSiteUrl } from './siteUrl.js'

export function buildSitemap(siteUrl, paths) {
  const base = normalizeSiteUrl(siteUrl)
  const urls = paths.map((path) => `  <url><loc>${base}${path === '/' ? '/' : path}</loc></url>`).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

export function buildRobots(siteUrl) {
  return `User-agent: *\nAllow: /\n\nSitemap: ${normalizeSiteUrl(siteUrl)}/sitemap.xml\n`
}
```

`src/lib/seo.js`: añadir imports y la función:

```js
import { profile } from '../data/profile'
import { services } from '../data/services'
import { localize } from '../data/localize'
import { getPageSeo } from '../data/seo'
```

```js
export function buildJsonLd() {
  const personId = `${SITE_URL}/#person`
  const address = { '@type': 'PostalAddress', addressLocality: 'Jaén', addressCountry: 'ES' }
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': personId,
        name: profile.name,
        url: `${SITE_URL}/`,
        jobTitle: 'Desarrollador web',
        email: `mailto:${profile.email}`,
        address,
        sameAs: [profile.github, profile.linkedin],
      },
      {
        '@type': 'ProfessionalService',
        '@id': `${SITE_URL}/#service`,
        name: `${profile.name} · Desarrollo web`,
        url: `${SITE_URL}/`,
        image: absoluteUrl(DEFAULT_OG_IMAGE),
        description: getPageSeo('/').description,
        founder: { '@id': personId },
        areaServed: 'ES',
        address,
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Servicios',
          itemListElement: services.map((service) => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: localize(service.title, 'es'),
              description: localize(service.message, 'es'),
            },
          })),
        },
      },
    ],
  }
}
```

`src/routes/home.jsx`: cambiar `meta` a:

```jsx
export const meta = () => [...buildMeta({ path: '/', ...getPageSeo('/') }), { 'script:ld+json': buildJsonLd() }]
```

(e importar `buildJsonLd` junto a `buildMeta`).

`src/data/seo.js`: en `caseSeo`, cambiar `image: undefined,` por `image: `/img/og-${slug}.jpg`,`.

`react-router.config.js` (reemplazar entero):

```js
import { copyFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { NOT_FOUND_PATH, PRERENDER_PATHS, PUBLIC_PATHS } from './src/data/site.js'
import { buildRobots, buildSitemap } from './src/lib/sitemap.js'

export default {
  appDirectory: 'src',
  ssr: false,
  prerender: PRERENDER_PATHS,
  async buildEnd({ viteConfig, reactRouterConfig }) {
    const clientDir = path.resolve(viteConfig.root, reactRouterConfig.buildDirectory, 'client')
    const siteUrl = viteConfig.env?.VITE_SITE_URL
    // Vercel serves /404.html with a 404 status for any unknown URL.
    await copyFile(path.join(clientDir, NOT_FOUND_PATH.slice(1), 'index.html'), path.join(clientDir, '404.html'))
    await writeFile(path.join(clientDir, 'sitemap.xml'), buildSitemap(siteUrl, PUBLIC_PATHS))
    await writeFile(path.join(clientDir, 'robots.txt'), buildRobots(siteUrl))
  },
}
```

```bash
git rm public/robots.txt
```

`package.json`, en `"scripts"`, añadir:

```json
    "og:images": "node scripts/og-images.js",
```

`scripts/og-images.js`:

```js
// Generates public/img/og-<slug>.jpg (1200×630) with the system Chrome. Run: npm run og:images
import { chromium } from '@playwright/test'
import { fileURLToPath } from 'node:url'
import { cases } from '../src/data/cases/index.js'
import { escapeHtml } from '../src/lib/escapeHtml.js'

const output = (slug) => fileURLToPath(new URL(`../public/img/og-${slug}.jpg`, import.meta.url))

const html = (item) => `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;700&family=JetBrains+Mono:wght@500&display=swap');
  body { margin: 0; width: 1200px; height: 630px; box-sizing: border-box; padding: 0 96px; display: flex; flex-direction: column; justify-content: center; gap: 28px;
    background: radial-gradient(60% 70% at 85% 20%, rgba(0,229,255,.22), transparent 70%), radial-gradient(50% 60% at 10% 90%, rgba(124,92,255,.25), transparent 70%), #07080d;
    color: #e8ecf4; font-family: Inter, system-ui, sans-serif; }
  .label { color: #00e5ff; font: 500 26px 'JetBrains Mono', monospace; }
  h1 { margin: 0; font-size: 120px; line-height: 1; letter-spacing: -0.03em; }
  p { margin: 0; max-width: 960px; color: #c9d1e0; font-size: 40px; line-height: 1.25; }
  .site { position: absolute; left: 96px; bottom: 56px; color: #8a93a6; font: 500 24px 'JetBrains Mono', monospace; }
</style>
</head>
<body>
  <div class="label">${escapeHtml(item.label.es)}</div>
  <h1>${escapeHtml(item.name)}</h1>
  <p>${escapeHtml(item.tagline.es)}</p>
  <div class="site">Miguel Ángel Domínguez · Caso de estudio</div>
</body>
</html>`

const browser = await chromium.launch({ channel: 'chrome' })
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
  for (const item of cases) {
    await page.setContent(html(item), { waitUntil: 'networkidle' })
    await page.screenshot({ path: output(item.slug), type: 'jpeg', quality: 88 })
    console.log(`public/img/og-${item.slug}.jpg`)
  }
} finally {
  await browser.close()
}
```

- [ ] **Step 5: Generar y revisar las imágenes OG**

Run: `npm run og:images`
Expected: imprime `public/img/og-solarmetrics.jpg` y `public/img/og-seenat.jpg`. Abrir ambas (p. ej. con la herramienta de lectura de imágenes): 1200×630, fondo oscuro, etiqueta cian, nombre grande y frase legible, sin texto cortado. Si Chrome no está en la ruta del sistema, el error lo dirá: no descargar navegadores; avisar al controlador.

- [ ] **Step 6: Tests, lint, build y artefactos de SEO**

Run: `npm test && npm run lint && npm run build`
Expected: todo en verde.

```bash
cat build/client/robots.txt
grep -c '<url>' build/client/sitemap.xml
grep -c 'application/ld+json' build/client/index.html
grep -c 'og-seenat.jpg' build/client/casos/seenat/index.html
grep -c 'application/ld+json' build/client/casos/seenat/index.html
```

Expected: robots con `Sitemap: https://miandoga.vercel.app/sitemap.xml`; `5` URLs (`/`, dos casos, dos legales; nunca `/404`); `1`; `1` o más (`og:image` y `twitter:image`); `0` (el JSON-LD solo va en `/`).

- [ ] **Step 7: Commit**

```bash
git add src/lib/sitemap.js src/lib/sitemap.test.js src/lib/seo.js src/lib/seo.test.js src/routes/home.jsx src/routes/home.test.jsx src/data/seo.js react-router.config.js package.json package-lock.json scripts/og-images.js public/img/og-solarmetrics.jpg public/img/og-seenat.jpg
git commit -m "Add structured data, sitemap, robots and per-case social images

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 18: Pruebas end-to-end con Playwright (Chrome del sistema)

> **Tipo:** integración (e2e contra el build de producción). Modelo capaz.

**Files:**
- Create: `playwright.config.js`, `e2e/helpers.js`, `e2e/home.spec.js`, `e2e/brief.spec.js`, `e2e/routes.spec.js`
- Modify: `package.json`

**Interfaces:**
- Consumes: `npm run preview` (servidor tipo Vercel en `:4173`), `PUBLIC_PATHS` (`src/data/site.js`), `getPageSeo` (`src/data/seo.js`), atributos `#hero[data-moment|data-instant]`, `.preloader`, ids de las secciones.
- Produces: `npm run test:e2e` = build + `playwright test`; e2e que cubren el spec §10 (hero final con `?scene=static`, brief completo contra `/api/brief` simulado, `<title>` por ruta prerenderizada, navegación del brief por teclado) y la ida y vuelta home → caso.

- [ ] **Step 1: Configuración**

`playwright.config.js`:

```js
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
  },
  // System Chrome: no browser download (spec decision).
  projects: [{ name: 'chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } }],
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 30_000,
  },
})
```

`package.json`, en `"scripts"`:

```json
    "test:e2e": "npm run build && playwright test",
```

`e2e/helpers.js`:

```js
import { expect } from '@playwright/test'

// Static tier: no WebGL, deterministic. The preloader is removed once the page is ready.
export async function openStatic(page, path = '/', hash = '') {
  await page.goto(`${path}?scene=static${hash}`)
  await expect(page.locator('.preloader')).toHaveCount(0, { timeout: 15_000 })
}

export function collectErrors(page) {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error' && /hydrat|react/i.test(message.text())) errors.push(message.text())
  })
  return errors
}
```

- [ ] **Step 2: E2E de la home** — `e2e/home.spec.js`:

```js
import { expect, test } from '@playwright/test'
import { collectErrors, openStatic } from './helpers.js'

test.describe('home', () => {
  test('ends on the final hero and can be skipped with a key', async ({ page }) => {
    const errors = collectErrors(page)
    await openStatic(page)
    await page.keyboard.press('Escape')
    const hero = page.locator('#hero')
    await expect(hero).toHaveAttribute('data-moment', '4')
    await expect(hero).toHaveAttribute('data-instant', 'true')
    await expect(page.getByRole('heading', { level: 1, name: 'Te la construyo. A medida.' })).toBeVisible()
    await expect(hero.getByRole('link', { name: 'Cuéntame tu proyecto' })).toBeVisible()
    await expect(hero.getByRole('link', { name: 'Ver casos' })).toBeVisible()
    expect(errors).toEqual([])
  })

  test('plays the intro by itself and only once per session', async ({ page }) => {
    await openStatic(page)
    await expect(page.locator('#hero')).toHaveAttribute('data-moment', '4', { timeout: 10_000 })
    await page.reload()
    await expect(page.locator('.preloader')).toHaveCount(0, { timeout: 15_000 })
    await expect(page.locator('#hero')).toHaveAttribute('data-moment', '4')
  })

  test('renders every section in order', async ({ page }) => {
    await openStatic(page)
    const ids = await page.locator('main section[id]').evaluateAll((sections) => sections.map((s) => s.id))
    expect(ids).toEqual(['hero', 'servicios', 'casos', 'proceso', 'quien-soy', 'ahora', 'brief'])
  })

  test('goes to a case and back with the scene and the hero still settled', async ({ page }) => {
    const errors = collectErrors(page)
    await openStatic(page)
    await page.keyboard.press('Escape')
    await page.getByRole('link', { name: /Ver el caso.*Seenat/ }).click()
    await expect(page).toHaveURL(/\/casos\/seenat$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Seenat' })).toBeVisible()
    await page.goBack()
    await expect(page.locator('#hero')).toHaveAttribute('data-moment', '4')
    expect(await page.evaluate(() => document.documentElement.dataset.scene)).toBe('static')
    expect(errors).toEqual([])
  })

  test.describe('with reduced motion', () => {
    test.use({ reducedMotion: 'reduce' })

    test('shows the three questions and the answer at once, and stacks the services', async ({ page }) => {
      await openStatic(page)
      await expect(page.locator('#hero')).toHaveAttribute('data-moment', '4')
      await expect(page.locator('.hero-q')).toHaveCount(3)
      for (const question of await page.locator('.hero-q').all()) await expect(question).toHaveAttribute('data-state', 'settled')
      await expect(page.locator('#servicios')).toHaveAttribute('data-mode', 'stacked')
    })
  })

  test.describe('on a phone', () => {
    test.use({ viewport: { width: 375, height: 812 } })

    test('stacks the services without a pin', async ({ page }) => {
      await openStatic(page)
      await expect(page.locator('#servicios')).toHaveAttribute('data-mode', 'stacked')
      const width = await page.evaluate(() => document.documentElement.scrollWidth)
      expect(width).toBeLessThanOrEqual(375)
    })
  })
})
```

- [ ] **Step 3: E2E del brief** — `e2e/brief.spec.js`:

```js
import { expect, test } from '@playwright/test'
import { openStatic } from './helpers.js'

async function mockApi(page, status = 200, body = { ok: true }) {
  const requests = []
  await page.route('**/api/brief', async (route) => {
    requests.push(route.request().postDataJSON())
    await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
  })
  return requests
}

test.describe('brief', () => {
  test('sends a complete brief to the API', async ({ page }) => {
    const requests = await mockApi(page)
    await openStatic(page, '/', '#brief')
    const brief = page.locator('#brief')
    await brief.getByText('Una herramienta', { exact: true }).click()
    await brief.getByRole('button', { name: 'Siguiente' }).click()
    await brief.getByLabel('Tu proyecto').fill('Necesito un panel para dejar de hacer informes a mano cada lunes.')
    await brief.getByText('Sustituir hojas de Excel').click()
    await brief.getByRole('button', { name: 'Siguiente' }).click()
    await brief.getByText('Sin prisa', { exact: true }).click()
    await brief.getByRole('button', { name: 'Siguiente' }).click()
    await brief.getByLabel('Nombre').fill('Ana')
    await brief.getByLabel('Email').fill('ana@example.es')
    await brief.getByRole('checkbox', { name: /política de privacidad/ }).check()
    await brief.getByRole('button', { name: 'Enviar' }).click()
    await expect(brief.getByRole('heading', { name: 'Recibido, Ana. Te respondo en menos de 48 h.' })).toBeVisible()
    expect(requests).toHaveLength(1)
    expect(requests[0]).toMatchObject({
      type: 'tool',
      tags: ['spreadsheets'],
      timeline: 'no-rush',
      name: 'Ana',
      email: 'ana@example.es',
      privacy: true,
      website: '',
    })
    expect(requests[0].elapsedMs).toBeGreaterThan(0)
  })

  test('can be completed with the keyboard only', async ({ page }) => {
    const requests = await mockApi(page)
    await openStatic(page, '/', '#brief')
    await page.getByRole('radio', { name: 'Una web' }).focus()
    await page.keyboard.press('Space')
    await page.keyboard.press('Enter')
    await expect(page.locator('#brief-question')).toHaveText('Cuéntame un poco más')
    await expect(page.locator('#brief-question')).toBeFocused()
    await page.keyboard.press('Tab')
    await page.keyboard.type('Quiero renovar la web de mi taller y añadir citas online.')
    await page.getByRole('button', { name: 'Siguiente' }).focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('#brief-question')).toHaveText('¿Para cuándo?')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Space')
    await page.keyboard.press('Enter')
    await expect(page.locator('#brief-question')).toHaveText('¿Cómo te contacto?')
    await page.keyboard.press('Tab')
    await page.keyboard.type('Luis')
    await page.keyboard.press('Tab')
    await page.keyboard.type('luis@example.es')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Space')
    await page.keyboard.press('Enter')
    await expect(page.getByRole('heading', { name: /^Recibido, Luis\./ })).toBeFocused()
    expect(requests[0]).toMatchObject({ type: 'web', timeline: 'asap', name: 'Luis' })
  })

  test('keeps the answers and recovers after a server error', async ({ page }) => {
    let calls = 0
    await page.route('**/api/brief', async (route) => {
      calls += 1
      await route.fulfill({
        status: calls === 1 ? 500 : 200,
        contentType: 'application/json',
        body: JSON.stringify(calls === 1 ? { error: 'send_failed' } : { ok: true }),
      })
    })
    await openStatic(page, '/', '#brief')
    const brief = page.locator('#brief')
    await brief.getByText('Una app', { exact: true }).click()
    await brief.getByRole('button', { name: 'Siguiente' }).click()
    await brief.getByLabel('Tu proyecto').fill('Una app para que los socios de mi club reserven pista.')
    await brief.getByRole('button', { name: 'Siguiente' }).click()
    await brief.getByText('Lo antes posible', { exact: true }).click()
    await brief.getByRole('button', { name: 'Siguiente' }).click()
    await brief.getByLabel('Nombre').fill('Marta')
    await brief.getByLabel('Email').fill('marta@example.es')
    await brief.getByRole('checkbox', { name: /política de privacidad/ }).check()
    await brief.getByRole('button', { name: 'Enviar' }).click()
    await expect(brief.getByText('No se ha podido enviar. Tus respuestas siguen aquí.')).toBeVisible()
    await expect(brief.getByLabel('Email')).toHaveValue('marta@example.es')
    await brief.getByRole('button', { name: 'Reintentar' }).click()
    await expect(brief.getByRole('heading', { name: /^Recibido, Marta\./ })).toBeVisible()
  })
})
```

- [ ] **Step 4: E2E de rutas** — `e2e/routes.spec.js`:

```js
import { expect, test } from '@playwright/test'
import { PUBLIC_PATHS } from '../src/data/site.js'
import { getPageSeo } from '../src/data/seo.js'

for (const path of PUBLIC_PATHS) {
  test(`serves ${path} prerendered with its own title`, async ({ page, request }) => {
    const { title } = getPageSeo(path)
    const response = await request.get(path)
    expect(response.status()).toBe(200)
    expect(await response.text()).toContain(`<title>${title}</title>`)
    await page.goto(`${path}?scene=static`)
    await expect(page).toHaveTitle(title)
  })
}

test('answers unknown URLs with the 404 page and status', async ({ page, request }) => {
  for (const path of ['/no-existe', '/casos/no-existe']) {
    expect((await request.get(path)).status()).toBe(404)
  }
  await page.goto('/casos/no-existe?scene=static')
  await expect(page.getByRole('heading', { level: 1, name: 'Esta página no existe' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/')
})

test('publishes the sitemap and robots.txt', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text()
  for (const path of PUBLIC_PATHS) expect(sitemap).toContain(`${path === '/' ? '/' : path}</loc>`)
  expect(sitemap).not.toContain('/404')
  expect(await (await request.get('/robots.txt')).text()).toContain('Sitemap: ')
})
```

- [ ] **Step 5: Ejecutar los e2e**

Run: `npm run test:e2e`
Expected: build correcto y todos los e2e en verde con Chrome del sistema. Si falla el arranque por el navegador, comprobar que existe `C:/Program Files/Google/Chrome/Application/chrome.exe`; nunca ejecutar `npx playwright install`.

- [ ] **Step 6: Unit tests, lint y commit**

Run: `npm test && npm run lint`
Expected: en verde (Vitest excluye `e2e/**`).

```bash
git add playwright.config.js e2e/helpers.js e2e/home.spec.js e2e/brief.spec.js e2e/routes.spec.js package.json
git commit -m "Add Playwright end-to-end tests against the production build

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 19: Verificación final, README y lista de Miguel

> **Tipo:** verificación (comandos, Lighthouse, revisión visual) + documentación. Modelo capaz; el controlador revisa las capturas.

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: todo lo anterior.
- Produces: README actualizado con scripts, arquitectura, configuración, despliegue y la lista "Pendiente de Miguel"; informe de verificación (en el mensaje final, **no** en archivos del repo).

- [ ] **Step 1: Batería completa**

```bash
npm test
npm run lint
npm run build
for f in $(grep -oE '/assets/[^"]+\.js' build/client/index.html | sort -u); do printf '%s %s\n' "$f" "$(grep -c __THREE_DEVTOOLS__ "build/client$f")"; done
grep -l __THREE_DEVTOOLS__ build/client/assets/*.js
npx playwright test
node -e "import('./api/brief.js').then((m) => console.log(typeof m.default.fetch))"
```

Expected: todo en verde; todas las líneas del bucle terminan en ` 0`; un único chunk con three (`SceneCanvas`); `function`.

- [ ] **Step 2: Lighthouse (escritorio, Chrome del sistema)** — los informes van a una carpeta temporal fuera del repo y nunca se suben:

```bash
LH_DIR="$(mktemp -d)"
npm run preview &
sleep 1
export CHROME_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe"
for target in "home|http://localhost:4173/" "seenat|http://localhost:4173/casos/seenat"; do
  name="${target%%|*}"; url="${target#*|}"
  npx --yes lighthouse "$url" --preset=desktop --only-categories=performance,accessibility,best-practices,seo \
    --chrome-flags="--headless=new" --output=json --output-path="$LH_DIR/$name.json" --quiet
  node -e "const r=require(process.argv[1]);console.log(process.argv[2], Object.fromEntries(Object.entries(r.categories).map(([k,v])=>[k,Math.round(v.score*100)])), 'LCP', r.audits['largest-contentful-paint'].displayValue)" "$LH_DIR/$name.json" "$name"
done
kill %1
```

Expected (spec §10): rendimiento ≥ 90, accesibilidad 100, SEO 100, buenas prácticas 100 en `/` y en `/casos/seenat`. Si algo no llega, abrir el JSON (`audits` con `score < 1`), corregir la causa en la tarea correspondiente con un commit propio (`fix: ...`) y repetir; no maquillar (p. ej. no desactivar la escena para Lighthouse). Si el rendimiento de `/` con WebGL en headless queda por debajo, medir también `/?scene=static` y anotar ambas cifras y el elemento LCP en el informe final.

- [ ] **Step 3: Revisión visual** — `npm run preview` y Chrome (o el panel de navegador) a **1440, 1024, 768 y 375 px**, cada una con la escena normal y con `?scene=static`, y una pasada con `prefers-reduced-motion: reduce` (DevTools → Rendering):
  - Home: secuencia del hero, pin de servicios (apilado a 375 y con reduced motion), casos, línea de proceso, lectura de "Quién soy", trayectoria, "Ahora mismo", brief y pie. Sin scroll horizontal; contraste AA de todo texto sobre la escena; foco visible en todo lo interactivo.
  - `/casos/solarmetrics`, `/casos/seenat`, `/privacidad`, `/aviso-legal`, `/no-existe`: escena atenuada, navbar con "Casos" activo en los casos, enlaces de sección que vuelven a `/#…`.
  - Transición tarjeta → caso en Chrome (y solo fundido con reduced motion).
  Anotar cualquier defecto y corregirlo con un commit `fix:` antes de seguir.

- [ ] **Step 4: README** — reemplazar `README.md` entero:

````markdown
# Portfolio · Miguel Ángel Domínguez García

Web para captar clientes y marca personal: un escritorio de developer en 3D (React Three Fiber) detrás de contenido HTML real y accesible. Home con hero en secuencia, servicios, casos, cómo trabajo, quién soy, ahora mismo y un brief guiado; páginas de caso de SolarMetrics y Seenat; privacidad y aviso legal.

## Stack

React 19 · React Router 7 (modo framework, prerender estático) · Vite 7 · three.js + @react-three/fiber/drei/postprocessing · GSAP + ScrollTrigger · Lenis · zustand · Resend (Vercel Function) · Vitest + Testing Library · Playwright

## Scripts

```bash
npm install
npm run dev        # desarrollo (http://localhost:5173)
npm test           # tests unitarios
npm run lint       # ESLint
npm run build      # prerender de todas las rutas en build/client
npm run preview    # sirve build/client como Vercel (http://localhost:4173)
npm run test:e2e   # build + Playwright con el Chrome del sistema
npm run og:images  # regenera public/img/og-<caso>.jpg
```

## Arquitectura

- `src/root.jsx`: layout raíz. La escena 3D (`src/scene/`), la navbar, el pie y el preloader se montan una vez y persisten entre rutas.
- `src/routes.js` + `src/routes/`: home, casos, legales y 404. `react-router.config.js` prerenderiza todas las rutas públicas (`src/data/site.js`) y, al terminar el build, genera `404.html`, `sitemap.xml` y `robots.txt`.
- La cámara elige pose con `resolvePoseId` (`src/scene/poses.js`): el `sceneCue` del hero y del pin de servicios manda sobre la sección visible.
- `/api/brief` (`api/brief.js` → `server/briefHandler.js`) valida con el mismo `src/lib/briefSchema.js` que el formulario y envía el correo con Resend.
- three.js solo se carga bajo demanda y nunca durante el prerender.

## Contenido

Todo el texto está en `src/data/` y `src/i18n/strings.js`, en español e inglés (la web muestra español; el selector llega en la fase D). `src/data/now.js` debe actualizarse al menos cada 120 días: un test falla para recordarlo.

## Configuración

| Variable | Dónde | Para qué |
|---|---|---|
| `VITE_SITE_URL` | `.env` y Vercel | Dominio público (canonical, Open Graph, sitemap). Por defecto `https://miandoga.vercel.app`. |
| `RESEND_API_KEY` | Vercel (no en `.env`) | Clave de Resend para enviar el brief. |
| `BRIEF_TO_EMAIL` | Vercel | Dónde llegan los briefs. |
| `BRIEF_FROM_EMAIL` | Vercel (opcional) | Remitente. Sin dominio verificado: `onboarding@resend.dev`. |

En `npm run dev` no existe `/api/brief`: el formulario mostrará el error con "Reintentar" y el email. El envío real se prueba en Vercel; el flujo completo, con la API simulada, en `npm run test:e2e`.

## Calidad del 3D

La calidad se detecta sola (`src/scene/quality.js`). Para probar un nivel concreto añade `?scene=high|medium|low|static`; `static` muestra el fondo sin WebGL.

## Imágenes

`scripts/process-images.py` genera la foto, el logo y la imagen general para redes (ver el script). Las imágenes por caso salen de `npm run og:images`.

## Pendiente de Miguel antes de publicar

1. **Resend**: crear la cuenta en https://resend.com con tu email, ir a *API Keys* → *Create API Key* (permiso *Sending access*) y copiar la clave (empieza por `re_`). Con `onboarding@resend.dev` como remitente, Resend solo entrega al email de tu propia cuenta: usa ese mismo email en `BRIEF_TO_EMAIL`. Si más adelante verificas un dominio en *Domains*, cambia `BRIEF_FROM_EMAIL` a una dirección de ese dominio.
2. **Vercel**: en el proyecto → *Settings* → *Environment Variables*, añadir `RESEND_API_KEY`, `BRIEF_TO_EMAIL` y (opcional) `BRIEF_FROM_EMAIL` para *Production* y *Preview*, y `VITE_SITE_URL` si el dominio no es `https://miandoga.vercel.app`. Volver a desplegar después de guardarlas.
3. **Probar el brief en producción**: enviar uno real desde la web desplegada y comprobar que llega, con "Responder a" apuntando al email escrito en el formulario.
4. **Textos legales**: revisar `src/data/legal.js` y añadir tu NIF (y domicilio si quieres darlo completo) en `profile.legal` de `src/data/profile.js`; la fila NIF aparece sola cuando no es `null`.
5. **Seenat**: confirmar con `npx supabase test db` el número de pruebas del backend (la web dice 163, suma actual de los `plan(n)`; `CLAUDE.md` de Seenat aún dice 158) y revisar el diario de `src/data/cases/seenat.js`.
6. **Copy por revisar**: etiquetas rápidas del brief para herramienta y app (`src/data/brief.js`), "48 h" y "30 días" del proceso.
7. **Contrato con Macrosad**: confirmar que no impide trabajar como freelance antes de publicar.
````

- [ ] **Step 5: Commit del README**

```bash
git add README.md
git commit -m "Document the v2 architecture, scripts and launch checklist

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 6: Comprobación final del árbol**

```bash
git status --short
git log --oneline -20
```

Expected: solo quedan sin seguimiento `.claude/` (y, si existe, `lint_output.txt`, que no se toca); ningún `build/`, `dist/`, JSON de Lighthouse ni `test-results/` en el historial. El informe final al controlador incluye: resultados de tests/lint/build/e2e, salida del chunk check, las cifras de Lighthouse de `/` y `/casos/seenat` (y de `?scene=static` si hizo falta), los defectos visuales encontrados y corregidos, y la lista "Pendiente de Miguel".
