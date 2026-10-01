# Portfolio 3D — Fase 1 (Base) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sustituir el portfolio actual por la versión 3D inmersiva: escritorio de developer low-poly en Three.js detrás de un contenido HTML completo (hero con la foto recortada de Miguel, sobre mí en bento, experiencia, proyectos, educación y contacto), con cámara guiada por scroll, calidad adaptativa y fallback sin WebGL.

**Architecture:** Un `<Canvas>` de React Three Fiber fijo a pantalla completa (capa `SceneLayer`) y encima el contenido HTML normal. Un store de zustand guarda la sección activa (detectada con IntersectionObserver) y el nivel de calidad; `CameraRig` interpola la cámara hacia la pose de la sección activa. Los monitores 3D pintan código, terminal y el dashboard de SolarMetrics con `CanvasTexture`. Todo el contenido vive en `src/data/*` con textos `{ es, en }` (la UI de idioma llega en la fase 2; en la fase 1 `useLang()` devuelve `'es'`).

**Tech Stack:** React 19.2, Vite 7, three 0.186, @react-three/fiber 9, @react-three/drei 10, @react-three/postprocessing 3, gsap 3.15 + @gsap/react, lenis 1.3, zustand 5, react-icons 5, Vitest 5 + Testing Library + jsdom. Script de imágenes en Python 3.12 con Pillow + rembg.

**Spec:** `docs/superpowers/specs/2026-09-30-portfolio-3d-redesign-design.md`

## Global Constraints

- Rama de trabajo: `redesign-3d`. Commits pequeños por tarea, terminados con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Paleta Midnight neon exacta: `--bg #07080d`, `--surface #131722`, `--accent #00e5ff`, `--accent-2 #7c5cff`, `--warm #ffb454`, `--text #e8ecf4`, `--text-muted #8a93a6`.
- Tipografías: display *Clash Display* (Fontshare) con fallback *Space Grotesk*/system-ui; texto *Inter*; código *JetBrains Mono*.
- Todo texto visible sale de `src/data/*` o `src/i18n/strings.js` y existe en `es` y `en`.
- El último puesto es **Web Developer @ Macrosad** (dic. 2025 – actualidad) y la experiencia va de más reciente a más antigua.
- Notas: "9.7 / 10" y "9.4 / 10".
- Sin formulario de contacto: copiar email + mailto + LinkedIn (+ GitHub).
- `prefers-reduced-motion: reduce` ⇒ sin Lenis, sin viajes de cámara, sin typewriter, contadores en valor final, preloader rápido.
- El canvas 3D es decorativo (`aria-hidden="true"`); todo el contenido debe poder leerse sin él.
- Objetivos: `npm run lint` sin errores, `npm test` en verde, `npm run build` correcto, Lighthouse rendimiento ≥ 80 (escritorio) y accesibilidad ≥ 95.
- No se crean cuentas ni se descargan modelos/archivos sin preguntar antes a Miguel (el modelo de rembg ocupa ~170 MB).

## Review Focus

1. **Dispositivo sin WebGL o contexto WebGL perdido a mitad de sesión** → la web sigue completa con el fondo `SceneFallback`. Tests: `SceneLayer` con tier `static`, `SceneErrorBoundary`, override `?scene=static` (Tareas 4 y 6).
2. **Red lenta o una tarea de precarga que falla o no termina** (CDN de fuentes bloqueado, imagen 404) → el preloader termina igual (fallos cuentan como hechos; timeout de 6 s). Tests en la Tarea 9.
3. **`prefers-reduced-motion`** → typewriter muestra el primer rol fijo, contadores en valor final, hook reactivo al cambio. Tests en Tareas 3, 10 y 11.
4. **Portapapeles no disponible o denegado** (http, iOS, permisos) → se muestra el email como enlace `mailto`. Tests en la Tarea 14.
5. **Navegación con navbar fija, Lenis y menú móvil** → los enlaces apuntan a ids existentes, el menú se cierra al pulsar un enlace o Escape, y las secciones no quedan tapadas por la navbar (`scroll-margin-top`). Tests en la Tarea 2; verificación manual en la Tarea 16.

---

## Mapa de archivos

```
index.html                         (reescrito: SEO, OG, fuentes, favicon)
.env                               VITE_SITE_URL
public/favicon.svg                 monograma
public/img/                        portrait-1086.webp, portrait-540.webp, solarmetrics-logo.webp, og-image.jpg
scripts/process-images.py          genera public/img/* (rembg + Pillow)
scripts/source/portrait-original.webp
src/main.jsx                       estilos globales + detección de tier antes de render
src/App.jsx                        composición
src/test/setup.js, src/test/mocks.js
src/data/                          localize, profile, sections, experience, projects, education, skills (+ data.test.js)
src/i18n/                          strings.js, useLang.js
src/lib/                           gsap.js, format.js, clipboard.js, loadImage.js
src/store/sceneStore.js            section, tier, lampOn
src/hooks/                         useReducedMotion, useSmoothScroll, useActiveSection, useTypewriter, usePreload
src/scene/                         quality, useQualityTier, loadScene, cameraPoses, layout, SceneLayer, SceneCanvas,
                                   SceneErrorBoundary, SceneFallback, CameraRig, Lights, Room, Desk, Monitors, Keyboard,
                                   Effects, useCanvasTexture, scene.css
src/scene/props/                   Props, Mug, Lamp, Plants, Headphones, Tower
src/scene/screens/                 code.js, terminal.js, dashboard.js, solar.js
src/components/                    Navbar, Preloader, Hero, HeroPortrait, About, CountUp, TechMarquee, Experience,
                                   Projects, DashboardPreview, Education, Contact, CopyEmailButton, Reveal, SectionHeading
src/components/css/                un CSS por componente
src/styles/tokens.css, src/styles/global.css
```

Se eliminan: `src/App.css`, `src/index.css`, `src/assets/react.svg`, los componentes y CSS antiguos de `src/components/`, `public/vite.svg`, `public/foto-perfil.JPG`, `public/SolarMetrics.png`.

---

### Task 1: Dependencias, entorno de tests y capa de datos

**Files:**
- Modify: `package.json`, `vite.config.js`
- Create: `src/test/setup.js`, `src/test/mocks.js`
- Create: `src/data/localize.js`, `src/data/profile.js`, `src/data/sections.js`, `src/data/experience.js`, `src/data/projects.js`, `src/data/education.js`, `src/data/skills.js`
- Create: `src/i18n/strings.js`, `src/i18n/useLang.js`
- Test: `src/data/data.test.js`

**Interfaces:**
- Produces:
  - `localize(value, lang = 'es')` → string/array; `DEFAULT_LANG = 'es'`
  - `profile` `{ name, shortName, email, linkedin, github, location{es,en}, roles{es:string[],en:string[]}, available{es,en}, bio{es,en}, stats: Array<{id, value:number, decimals?:number, suffix?:string, label{es,en}}> }`
  - `SECTIONS: Array<{id, label{es,en}}>`, `SECTION_IDS: string[]` = `['hero','about','experience','projects','education','contact']`
  - `experience: Array<{id, role{es,en}, company, location, start:'YYYY-MM', end:'YYYY-MM'|null, period{es,en}, tasks{es:string[],en:string[]}}>`
  - `projects: Array<{id, title, tag{es,en}, summary{es,en}, problem{es,en}, solution{es,en}, stack:string[], live, github, logo{src,width,height}}>`
  - `education: Array<{id, degree{es,en}, place, period{es,en}, grade:string, note{es,en}}>`
  - `TECH: Record<string,{name, Icon, color}>`, `skillCategories: Array<{id, label{es,en}, items:string[]}>`
  - `strings: Record<string,{es,en}>`, `useLang()` → `'es'`, `useT()` → `(key) => string`
  - `mockMatchMedia(matchesFn)` → `{ emit(matches) }`; `MockIntersectionObserver` con `.instances` y `trigger(entries)`

- [ ] **Step 1: Cambiar dependencias**

```bash
npm uninstall react-tsparticles tsparticles-engine tsparticles-slim
npm install three@^0.186.1 @react-three/fiber@^9.8.1 @react-three/drei@^10.7.9 @react-three/postprocessing@^3.1.3 postprocessing@^6.36.0 gsap@^3.15.0 @gsap/react@^2.1.2 lenis@^1.3.26 zustand@^5.0.15
npm install -D vitest@^5.0.3 jsdom@^30.1.1 @testing-library/react@^16.3.3 @testing-library/dom@^10.4.1 @testing-library/jest-dom@^7.0.1 @testing-library/user-event@^14.6.7
```

Expected: sin errores `ERESOLVE`. Si npm se queja de peers, resolver ajustando versiones, nunca con `--force`.

- [ ] **Step 2: Scripts de test en `package.json`**

En `"scripts"` añadir:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Configurar Vitest** — reemplazar `vite.config.js`:

```js
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    css: false,
  },
})
```

- [ ] **Step 4: Mocks de test** — crear `src/test/mocks.js`:

```js
import { vi } from 'vitest'

export function mockMatchMedia(matchesFn = () => false) {
  const listeners = new Set()
  window.matchMedia = vi.fn((query) => ({
    get matches() {
      return matchesFn(query)
    },
    media: query,
    onchange: null,
    addEventListener: (_type, cb) => listeners.add(cb),
    removeEventListener: (_type, cb) => listeners.delete(cb),
    addListener: (cb) => listeners.add(cb),
    removeListener: (cb) => listeners.delete(cb),
    dispatchEvent: () => true,
  }))
  return { emit: (matches) => listeners.forEach((cb) => cb({ matches })) }
}

export class MockIntersectionObserver {
  static instances = []

  constructor(callback, options) {
    this.callback = callback
    this.options = options
    this.elements = new Set()
    MockIntersectionObserver.instances.push(this)
  }

  observe(el) {
    this.elements.add(el)
  }

  unobserve(el) {
    this.elements.delete(el)
  }

  disconnect() {
    this.elements.clear()
  }

  trigger(entries) {
    this.callback(entries, this)
  }
}
```

Crear `src/test/setup.js`:

```js
import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import { mockMatchMedia, MockIntersectionObserver } from './mocks'

window.IntersectionObserver = MockIntersectionObserver
globalThis.IntersectionObserver = MockIntersectionObserver
HTMLCanvasElement.prototype.getContext = () => null
window.scrollTo = () => {}

beforeEach(() => {
  mockMatchMedia(() => false)
})

afterEach(() => {
  cleanup()
  MockIntersectionObserver.instances = []
})
```

- [ ] **Step 5: Escribir el test de datos (falla)** — crear `src/data/data.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { localize } from './localize'
import { profile } from './profile'
import { SECTIONS, SECTION_IDS } from './sections'
import { experience } from './experience'
import { projects } from './projects'
import { education } from './education'
import { TECH, skillCategories } from './skills'
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
    for (const project of projects) {
      for (const key of ['tag', 'summary', 'problem', 'solution']) {
        expect(isLocalized(project[key]), `${project.id}.${key}`).toBe(true)
      }
    }
    for (const item of education) {
      expect(isLocalized(item.degree), item.id).toBe(true)
      expect(isLocalized(item.note), item.id).toBe(true)
    }
    for (const section of SECTIONS) expect(isLocalized(section.label), section.id).toBe(true)
    for (const category of skillCategories) expect(isLocalized(category.label), category.id).toBe(true)
    for (const [key, value] of Object.entries(strings)) expect(isLocalized(value), key).toBe(true)
    for (const stat of profile.stats) expect(isLocalized(stat.label), stat.id).toBe(true)
    expect(isLocalized(profile.bio)).toBe(true)
    expect(profile.roles.es.length).toBe(profile.roles.en.length)
  })

  it('shows grades out of 10', () => {
    for (const item of education) expect(item.grade).toMatch(/ \/ 10$/)
  })

  it('uses unique section ids in page order', () => {
    expect(SECTION_IDS).toEqual(['hero', 'about', 'experience', 'projects', 'education', 'contact'])
  })

  it('only references known technologies', () => {
    const used = [...skillCategories.flatMap((c) => c.items), ...projects.flatMap((p) => p.stack)]
    for (const id of used) expect(TECH[id], id).toBeDefined()
  })
})
```

- [ ] **Step 6: Ejecutar y ver que falla**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "./localize"`.

- [ ] **Step 7: Implementar los datos**

`src/data/localize.js`:

```js
export const DEFAULT_LANG = 'es'

const isLocalized = (value) => Boolean(value) && typeof value === 'object' && 'es' in value && 'en' in value

export function localize(value, lang = DEFAULT_LANG) {
  if (!isLocalized(value)) return value
  return value[lang] ?? value[DEFAULT_LANG]
}
```

`src/data/profile.js`:

```js
export const profile = {
  name: 'Miguel Ángel Domínguez García',
  shortName: 'Miguel Ángel',
  email: 'miguelangelespeluy@gmail.com',
  linkedin: 'https://www.linkedin.com/in/miguel-%C3%A1ngel-dom%C3%ADnguez-garc%C3%ADa-4a0a03265/',
  github: 'https://github.com/mdomgar',
  location: { es: 'Jaén, España', en: 'Jaén, Spain' },
  roles: {
    es: ['Web Developer', 'Full Stack', 'Backend lover'],
    en: ['Web Developer', 'Full Stack', 'Backend lover'],
  },
  available: { es: 'Disponible para nuevos proyectos', en: 'Open to new opportunities' },
  bio: {
    es: 'Soy de Jaén y me apasiona la informática y el desarrollo de software. Tengo doble titulación en Administración de Sistemas Informáticos en Red y en Desarrollo de Aplicaciones Multiplataforma. Me considero una persona tranquila, ordenada y comprometida, con una fuerte vocación por la tecnología y el aprendizaje continuo. Mi objetivo es seguir creciendo como desarrollador full stack, aportando soluciones eficientes y de calidad.',
    en: "I'm from Jaén and I'm passionate about computing and software development. I hold two higher technical degrees, in Network Computer Systems Administration and in Multiplatform Application Development. I'm calm, organised and committed, with a strong drive for technology and continuous learning. My goal is to keep growing as a full stack developer, delivering efficient, high-quality solutions.",
  },
  stats: [
    { id: 'grade', value: 9.7, decimals: 1, label: { es: 'Nota media en DAM', en: 'DAM average grade' } },
    { id: 'companies', value: 4, label: { es: 'Empresas', en: 'Companies' } },
    { id: 'years', value: 3, suffix: '+', label: { es: 'Años en IT', en: 'Years in IT' } },
  ],
}
```

`src/data/sections.js`:

```js
export const SECTIONS = [
  { id: 'hero', label: { es: 'Inicio', en: 'Home' } },
  { id: 'about', label: { es: 'Sobre mí', en: 'About' } },
  { id: 'experience', label: { es: 'Experiencia', en: 'Experience' } },
  { id: 'projects', label: { es: 'Proyectos', en: 'Projects' } },
  { id: 'education', label: { es: 'Educación', en: 'Education' } },
  { id: 'contact', label: { es: 'Contacto', en: 'Contact' } },
]

export const SECTION_IDS = SECTIONS.map((section) => section.id)
```

`src/data/experience.js`:

```js
export const experience = [
  {
    id: 'macrosad',
    role: { es: 'Web Developer', en: 'Web Developer' },
    company: 'Macrosad',
    location: 'Jaén',
    start: '2025-12',
    end: null,
    period: { es: 'Diciembre 2025 – Actualidad', en: 'December 2025 – Present' },
    tasks: {
      es: [
        'Desarrollo de aplicaciones empresariales con Node.js y React.',
        'Testeo y consumo de APIs RESTful.',
      ],
      en: ['Building enterprise applications with Node.js and React.', 'Testing and consuming RESTful APIs.'],
    },
  },
  {
    id: 'grupo-avanza',
    role: { es: 'Técnico Auxiliar IT', en: 'IT Support Technician' },
    company: 'Grupo Avanza',
    location: 'Jaén',
    start: '2023-03',
    end: '2024-08',
    period: { es: 'Marzo – Junio 2023 / Marzo – Agosto 2024', en: 'March – June 2023 / March – August 2024' },
    tasks: {
      es: [
        'Soporte técnico de hardware y software.',
        'Gestión de servidores Windows Server y Hetzner.',
        'Administración de redes y DNS.',
        'Gestión del servicio de ticketing y de las suites de Google y Microsoft.',
      ],
      en: [
        'Hardware and software technical support.',
        'Managing Windows Server and Hetzner servers.',
        'Network and DNS administration.',
        'Managing the ticketing service and the Google and Microsoft suites.',
      ],
    },
  },
  {
    id: 'intelec',
    role: { es: 'Desarrollador Full Stack y Odoo', en: 'Full Stack & Odoo Developer' },
    company: 'Intelec',
    location: 'Jaén',
    start: '2024-03',
    end: '2024-06',
    period: { es: 'Marzo – Junio 2024', en: 'March – June 2024' },
    tasks: {
      es: [
        'Desarrollo con Java, Spring Boot y React, consumiendo APIs desarrolladas por mí mismo.',
        'Creación de módulos personalizados de Odoo en Python, probados en un entorno Docker.',
        'Gestión de modelos, vistas y lógica de negocio, y creación de portales para clientes y trabajadores.',
      ],
      en: [
        'Development with Java, Spring Boot and React, consuming APIs I built myself.',
        'Custom Odoo modules in Python, tested in a Docker environment.',
        'Models, views and business logic, plus client and employee portals.',
      ],
    },
  },
  {
    id: 'mecaofi',
    role: { es: 'Técnico Informático', en: 'IT Technician' },
    company: 'Mecaofi Jaén 1992',
    location: 'Jaén',
    start: '2023-11',
    end: '2024-02',
    period: { es: 'Noviembre 2023 – Febrero 2024', en: 'November 2023 – February 2024' },
    tasks: {
      es: [
        'Mantenimiento de la infraestructura informática en centros educativos.',
        'Reparación de equipos y resolución de incidencias.',
      ],
      en: ['Maintaining IT infrastructure in schools.', 'Hardware repair and incident resolution.'],
    },
  },
]
```

`src/data/projects.js`:

```js
export const projects = [
  {
    id: 'solarmetrics',
    title: 'SolarMetrics',
    tag: { es: 'Proyecto final de DAM', en: 'Final degree project' },
    summary: {
      es: 'Portal web para visualizar datos de medición fotovoltaica, con login y gestión de usuarios.',
      en: 'Web portal to visualise photovoltaic measurement data, with login and user management.',
    },
    problem: {
      es: 'Los datos de una instalación fotovoltaica son difíciles de interpretar cuando solo existen como series numéricas en una base de datos.',
      en: 'Photovoltaic installation data is hard to read when it only exists as raw time series in a database.',
    },
    solution: {
      es: 'El backend genera datos de medición simulados y los almacena en InfluxDB; el frontend en React consume la API y los muestra de forma dinámica, con sistema de login y gestión de usuarios.',
      en: 'The backend generates simulated measurements and stores them in InfluxDB; the React frontend consumes the API and renders them dynamically, with login and user management.',
    },
    stack: ['react', 'javascript', 'springboot', 'java', 'python', 'influxdb'],
    live: 'https://solarmetrics.vercel.app',
    github: 'https://github.com/mdomgar/SolarMetrics',
    logo: { src: '/img/solarmetrics-logo.webp', width: 256, height: 256 },
  },
]
```

`src/data/education.js`:

```js
export const education = [
  {
    id: 'dam',
    degree: {
      es: 'Técnico Superior en Desarrollo de Aplicaciones Multiplataforma',
      en: 'Higher Technician in Multiplatform Application Development',
    },
    place: 'IES Virgen del Carmen, Jaén',
    period: { es: 'Septiembre 2022 – Junio 2024', en: 'September 2022 – June 2024' },
    grade: '9.7 / 10',
    note: { es: 'Proyecto final: SolarMetrics', en: 'Final project: SolarMetrics' },
  },
  {
    id: 'asir',
    degree: {
      es: 'Técnico Superior en Administración de Sistemas Informáticos en Red',
      en: 'Higher Technician in Network Computer Systems Administration',
    },
    place: 'IES Virgen del Carmen, Jaén',
    period: { es: 'Septiembre 2020 – Junio 2022', en: 'September 2020 – June 2022' },
    grade: '9.4 / 10',
    note: { es: 'Proyecto final de ciclo', en: 'Final degree project' },
  },
]
```

`src/data/skills.js`:

```js
import { FaCss3Alt, FaHtml5, FaJava, FaNodeJs, FaPython, FaReact } from 'react-icons/fa'
import {
  SiDocker,
  SiGithub,
  SiInfluxdb,
  SiIntellijidea,
  SiJavascript,
  SiMongodb,
  SiMysql,
  SiPostman,
  SiSpringboot,
  SiVirtualbox,
} from 'react-icons/si'
import { BiLogoVisualStudio } from 'react-icons/bi'

export const TECH = {
  javascript: { name: 'JavaScript', Icon: SiJavascript, color: '#f7df1e' },
  java: { name: 'Java', Icon: FaJava, color: '#ea2d2e' },
  python: { name: 'Python', Icon: FaPython, color: '#3776ab' },
  react: { name: 'React', Icon: FaReact, color: '#61dafb' },
  html: { name: 'HTML', Icon: FaHtml5, color: '#e34f26' },
  css: { name: 'CSS', Icon: FaCss3Alt, color: '#2965f1' },
  node: { name: 'Node.js', Icon: FaNodeJs, color: '#5fa04e' },
  springboot: { name: 'Spring Boot', Icon: SiSpringboot, color: '#6db33f' },
  mysql: { name: 'MySQL', Icon: SiMysql, color: '#4479a1' },
  mongodb: { name: 'MongoDB', Icon: SiMongodb, color: '#47a248' },
  influxdb: { name: 'InfluxDB', Icon: SiInfluxdb, color: '#22adf4' },
  docker: { name: 'Docker', Icon: SiDocker, color: '#2496ed' },
  github: { name: 'GitHub', Icon: SiGithub, color: '#e8ecf4' },
  vscode: { name: 'VS Code', Icon: BiLogoVisualStudio, color: '#007acc' },
  intellij: { name: 'IntelliJ IDEA', Icon: SiIntellijidea, color: '#fe315d' },
  postman: { name: 'Postman', Icon: SiPostman, color: '#ff6c37' },
  virtualbox: { name: 'VirtualBox', Icon: SiVirtualbox, color: '#00ccc2' },
}

export const skillCategories = [
  { id: 'languages', label: { es: 'Lenguajes', en: 'Languages' }, items: ['javascript', 'java', 'python'] },
  { id: 'frontend', label: { es: 'Frontend', en: 'Frontend' }, items: ['react', 'html', 'css'] },
  {
    id: 'backend',
    label: { es: 'Backend y datos', en: 'Backend & data' },
    items: ['node', 'springboot', 'mysql', 'mongodb', 'influxdb', 'docker'],
  },
  {
    id: 'tools',
    label: { es: 'Herramientas', en: 'Tools' },
    items: ['github', 'vscode', 'intellij', 'postman', 'virtualbox'],
  },
]
```

`src/i18n/strings.js`:

```js
export const strings = {
  skipToContent: { es: 'Saltar al contenido', en: 'Skip to content' },
  navLabel: { es: 'Navegación principal', en: 'Main navigation' },
  menuOpen: { es: 'Abrir menú', en: 'Open menu' },
  menuClose: { es: 'Cerrar menú', en: 'Close menu' },
  loading: { es: 'Cargando', en: 'Loading' },
  portraitAlt: { es: 'Miguel Ángel con los brazos cruzados', en: 'Miguel Ángel with his arms crossed' },
  heroCtaProjects: { es: 'Ver proyectos', en: 'See projects' },
  heroCtaContact: { es: 'Contactar', en: 'Get in touch' },
  scrollHint: { es: 'Bajar a Sobre mí', en: 'Scroll to About' },
  aboutTitle: { es: 'Sobre mí', en: 'About me' },
  aboutHello: { es: '¡Hola! Soy Miguel Ángel', en: "Hi! I'm Miguel Ángel" },
  aboutNow: { es: 'Ahora mismo', en: 'Right now' },
  aboutBasedIn: { es: 'Desde', en: 'Based in' },
  aboutStack: { es: 'Mi stack', en: 'My stack' },
  experienceTitle: { es: 'Experiencia', en: 'Experience' },
  current: { es: 'Actual', en: 'Current' },
  projectsTitle: { es: 'Proyectos', en: 'Projects' },
  projectProblem: { es: 'El problema', en: 'The problem' },
  projectSolution: { es: 'La solución', en: 'The solution' },
  projectStack: { es: 'Stack tecnológico', en: 'Tech stack' },
  projectLive: { es: 'Ver demo', en: 'Live demo' },
  projectCode: { es: 'Código', en: 'Source code' },
  dashboardAlt: {
    es: 'Vista animada del panel de SolarMetrics con potencia, energía y curva de producción solar',
    en: 'Animated view of the SolarMetrics dashboard with power, energy and the solar production curve',
  },
  educationTitle: { es: 'Educación', en: 'Education' },
  contactTitle: { es: '¿Hablamos?', en: "Let's talk" },
  contactText: {
    es: '¿Tienes un proyecto en mente, una oportunidad o simplemente quieres saludar? Mi bandeja de entrada siempre está abierta.',
    en: 'Got a project in mind, an opportunity, or just want to say hi? My inbox is always open.',
  },
  copyEmail: { es: 'Copiar email', en: 'Copy email' },
  emailCopied: { es: 'Email copiado', en: 'Email copied' },
  copyFailed: { es: 'No se pudo copiar. Aquí lo tienes:', en: "Couldn't copy it. Here it is:" },
  writeEmail: { es: 'Escribir email', en: 'Send an email' },
  footerBuilt: { es: 'Hecho con React y Three.js', en: 'Built with React and Three.js' },
}
```

`src/i18n/useLang.js`:

```js
import { DEFAULT_LANG, localize } from '../data/localize'
import { strings } from './strings'

// Fase 1: solo español. La fase 2 sustituye esto por el contexto de idioma.
export function useLang() {
  return DEFAULT_LANG
}

export function useT() {
  const lang = useLang()
  return (key) => localize(strings[key], lang)
}
```

- [ ] **Step 8: Ejecutar tests**

Run: `npm test`
Expected: PASS (9 tests en `data.test.js`).

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json vite.config.js src/test src/data src/i18n
git commit -m "Add test setup and bilingual content data layer"
```

---

### Task 2: Estilos base, HTML/SEO, store de escena, Navbar y nuevo App

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/global.css`, `public/favicon.svg`, `.env`
- Create: `src/store/sceneStore.js`, `src/store/sceneStore.test.js`
- Create: `src/components/Navbar.jsx`, `src/components/css/Navbar.css`, `src/components/Navbar.test.jsx`
- Modify: `index.html`, `src/main.jsx`, `src/App.jsx` (reescritos)
- Delete: `src/App.css`, `src/index.css`, `src/assets/react.svg`, `src/components/{AboutMe,ContactMe,Education,Experience,Header,Projects,Skills,Stars}.jsx`, `src/components/css/{AboutMe,ContactMe,Education,Experience,Header,Projects,Skills}.css`, `public/vite.svg`

**Interfaces:**
- Consumes: `SECTIONS`, `localize`, `useLang`, `useT` (Task 1)
- Produces:
  - `useSceneStore` (zustand) con estado `{ section: string, tier: null|'static'|'low'|'medium'|'high', lampOn: boolean }` y acciones `setSection(id)`, `setTier(tier)`, `downgrade()`, `toggleLamp()`; `TIERS = ['static','low','medium','high']`
  - Clases CSS globales: `.container`, `.section`, `.card`, `.btn`, `.btn-primary`, `.chip`, `.chip-live`, `.dot`, `.mono`, `.sr-only`, `.skip-link`, `.gradient-text`, `.section-heading`, `.section-eyebrow`
  - `<main id="main">` en `App.jsx`, donde las tareas siguientes añaden secciones

- [ ] **Step 1: Test del store (falla)** — `src/store/sceneStore.test.js`:

```js
import { beforeEach, describe, expect, it } from 'vitest'
import { useSceneStore } from './sceneStore'

beforeEach(() => {
  useSceneStore.setState(useSceneStore.getInitialState(), true)
})

describe('sceneStore', () => {
  it('starts at the hero with no tier and the lamp on', () => {
    expect(useSceneStore.getState()).toMatchObject({ section: 'hero', tier: null, lampOn: true })
  })

  it('downgrades one quality step at a time and never below low', () => {
    const { setTier, downgrade } = useSceneStore.getState()
    setTier('high')
    downgrade()
    expect(useSceneStore.getState().tier).toBe('medium')
    downgrade()
    expect(useSceneStore.getState().tier).toBe('low')
    downgrade()
    expect(useSceneStore.getState().tier).toBe('low')
  })

  it('ignores downgrade while the tier is unknown or static', () => {
    useSceneStore.getState().downgrade()
    expect(useSceneStore.getState().tier).toBe(null)
    useSceneStore.getState().setTier('static')
    useSceneStore.getState().downgrade()
    expect(useSceneStore.getState().tier).toBe('static')
  })

  it('toggles the desk lamp', () => {
    useSceneStore.getState().toggleLamp()
    expect(useSceneStore.getState().lampOn).toBe(false)
  })
})
```

- [ ] **Step 2: Ejecutar** — Run: `npx vitest run src/store` → Expected: FAIL (`./sceneStore` no existe).

- [ ] **Step 3: Implementar** — `src/store/sceneStore.js`:

```js
import { create } from 'zustand'

export const TIERS = ['static', 'low', 'medium', 'high']

export const useSceneStore = create((set, get) => ({
  section: 'hero',
  tier: null,
  lampOn: true,
  setSection: (section) => set({ section }),
  setTier: (tier) => set({ tier }),
  downgrade: () => {
    const index = TIERS.indexOf(get().tier)
    if (index > 1) set({ tier: TIERS[index - 1] })
  },
  toggleLamp: () => set((state) => ({ lampOn: !state.lampOn })),
}))
```

- [ ] **Step 4: Ejecutar** — Run: `npx vitest run src/store` → Expected: PASS (4 tests).

- [ ] **Step 5: Test de la Navbar (falla)** — `src/components/Navbar.test.jsx`:

```jsx
import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import Navbar from './Navbar'
import { useSceneStore } from '../store/sceneStore'

beforeEach(() => {
  useSceneStore.setState(useSceneStore.getInitialState(), true)
})

const navLinks = () => screen.getAllByRole('link').filter((a) => !['#main', '#hero'].includes(a.getAttribute('href')))

describe('Navbar', () => {
  it('links to every content section in page order', () => {
    render(<Navbar />)
    expect(navLinks().map((a) => a.getAttribute('href'))).toEqual([
      '#about',
      '#experience',
      '#projects',
      '#education',
      '#contact',
    ])
  })

  it('opens the mobile menu and closes it after choosing a link', () => {
    render(<Navbar />)
    const toggle = screen.getByRole('button', { name: 'Abrir menú' })
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(toggle).toHaveAccessibleName('Cerrar menú')
    fireEvent.click(screen.getByRole('link', { name: 'Proyectos' }))
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes the mobile menu with Escape', () => {
    render(<Navbar />)
    const toggle = screen.getByRole('button', { name: 'Abrir menú' })
    fireEvent.click(toggle)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('marks the active section', () => {
    render(<Navbar />)
    act(() => useSceneStore.getState().setSection('experience'))
    expect(screen.getByRole('link', { name: 'Experiencia' })).toHaveAttribute('aria-current', 'true')
    expect(screen.getByRole('link', { name: 'Proyectos' })).not.toHaveAttribute('aria-current')
  })

  it('offers a skip link to the main content', () => {
    render(<Navbar />)
    expect(screen.getByRole('link', { name: 'Saltar al contenido' })).toHaveAttribute('href', '#main')
  })
})
```

- [ ] **Step 6: Ejecutar** — Run: `npx vitest run src/components/Navbar.test.jsx` → Expected: FAIL (`./Navbar` no existe).

- [ ] **Step 7: Implementar Navbar** — `src/components/Navbar.jsx`:

```jsx
import { useEffect, useState } from 'react'
import { SECTIONS } from '../data/sections'
import { localize } from '../data/localize'
import { useLang, useT } from '../i18n/useLang'
import { useSceneStore } from '../store/sceneStore'
import './css/Navbar.css'

const NAV_ITEMS = SECTIONS.filter((section) => section.id !== 'hero')

export default function Navbar() {
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
    <header className={`navbar${scrolled ? ' is-scrolled' : ''}`}>
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
```

`src/components/css/Navbar.css`:

```css
.navbar {
  position: fixed;
  inset: 0 0 auto;
  z-index: 50;
  height: var(--nav-h);
  display: flex;
  align-items: center;
  border-bottom: 1px solid transparent;
  transition: background 0.3s, border-color 0.3s;
}

.navbar.is-scrolled {
  background: rgba(7, 8, 13, 0.72);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom-color: var(--border);
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.navbar-brand {
  font-family: var(--font-mono);
  font-weight: 500;
  color: var(--accent);
  text-shadow: 0 0 12px rgba(0, 229, 255, 0.45);
}

.navbar-links {
  display: flex;
  gap: 2rem;
}

.navbar-links a {
  position: relative;
  padding-block: 0.25rem;
  color: var(--text-muted);
  font-size: 0.95rem;
  transition: color 0.2s;
}

.navbar-links a::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -2px;
  height: 2px;
  background: var(--accent);
  box-shadow: 0 0 8px rgba(0, 229, 255, 0.6);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s var(--ease-out);
}

.navbar-links a:hover,
.navbar-links a[aria-current='true'] {
  color: var(--text);
}

.navbar-links a:hover::after,
.navbar-links a[aria-current='true']::after {
  transform: scaleX(1);
}

.navbar-toggle {
  display: none;
}

@media (max-width: 767px) {
  .navbar-toggle {
    display: inline-flex;
    flex-direction: column;
    justify-content: center;
    gap: 6px;
    width: 44px;
    height: 44px;
    padding: 0 11px;
    background: transparent;
    border: 1px solid var(--border-strong);
    border-radius: 12px;
    cursor: pointer;
  }

  .navbar-toggle span {
    display: block;
    height: 2px;
    background: var(--text);
    border-radius: 2px;
    transition: transform 0.3s var(--ease-out);
  }

  .navbar-toggle[aria-expanded='true'] span:first-child {
    transform: translateY(4px) rotate(45deg);
  }

  .navbar-toggle[aria-expanded='true'] span:last-child {
    transform: translateY(-4px) rotate(-45deg);
  }

  .navbar-links {
    position: fixed;
    top: var(--nav-h);
    left: 0;
    right: 0;
    flex-direction: column;
    gap: 0;
    padding: 0.5rem 16px 1.25rem;
    background: rgba(7, 8, 13, 0.95);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border-bottom: 1px solid var(--border);
    opacity: 0;
    visibility: hidden;
    transform: translateY(-8px);
    transition: opacity 0.25s, transform 0.25s, visibility 0.25s;
  }

  .navbar-links.is-open {
    opacity: 1;
    visibility: visible;
    transform: none;
  }

  .navbar-links a {
    display: block;
    padding: 0.9rem 0;
    font-size: 1.1rem;
  }
}
```

- [ ] **Step 8: Ejecutar** — Run: `npx vitest run src/components/Navbar.test.jsx` → Expected: PASS (5 tests).

- [ ] **Step 9: Tokens y estilos globales**

`src/styles/tokens.css`:

```css
:root {
  --bg: #07080d;
  --surface: #131722;
  --surface-2: #1a2030;
  --border: rgba(232, 236, 244, 0.1);
  --border-strong: rgba(232, 236, 244, 0.22);
  --accent: #00e5ff;
  --accent-2: #7c5cff;
  --warm: #ffb454;
  --success: #3ddc97;
  --text: #e8ecf4;
  --text-muted: #8a93a6;

  --font-display: 'Clash Display', 'Space Grotesk', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;

  --radius: 16px;
  --radius-sm: 10px;
  --nav-h: 72px;
  --container: 1200px;
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
}
```

`src/styles/global.css`:

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  background: var(--bg);
  color-scheme: dark;
  -webkit-text-size-adjust: 100%;
}

html.is-loading {
  overflow: hidden;
}

body {
  margin: 0;
  min-width: 320px;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

img {
  display: block;
  max-width: 100%;
  height: auto;
}

a {
  color: inherit;
  text-decoration: none;
}

h1,
h2,
h3,
h4 {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.01em;
}

p,
dl,
dd {
  margin: 0;
}

ul,
ol {
  margin: 0;
  padding: 0;
  list-style: none;
}

:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
  border-radius: 4px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.skip-link {
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 100;
  padding: 0.6rem 1rem;
  border-radius: var(--radius-sm);
  background: var(--accent);
  color: var(--bg);
  font-weight: 600;
  transform: translateY(-200%);
  transition: transform 0.2s;
}

.skip-link:focus {
  transform: none;
}

.container {
  width: min(100% - 32px, var(--container));
  margin-inline: auto;
}

main {
  position: relative;
  z-index: 1;
}

.section {
  position: relative;
  padding-block: clamp(5rem, 14vh, 9rem);
  scroll-margin-top: var(--nav-h);
}

.section-heading {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  margin-bottom: clamp(2rem, 5vh, 3.5rem);
}

.section-heading h2 {
  font-size: clamp(2.2rem, 5vw, 3.6rem);
}

.section-eyebrow {
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 0.9rem;
}

.mono {
  font-family: var(--font-mono);
}

.card {
  background: rgba(19, 23, 34, 0.72);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

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
  transition: transform 0.25s var(--ease-out), background 0.25s, border-color 0.25s, box-shadow 0.25s;
}

.btn:hover {
  border-color: var(--accent);
  box-shadow: 0 0 24px rgba(0, 229, 255, 0.18);
  transform: translateY(-2px);
}

.btn-primary {
  background: var(--accent);
  border-color: var(--accent);
  color: #041016;
}

.btn-primary:hover {
  background: #5cf0ff;
  box-shadow: 0 0 32px rgba(0, 229, 255, 0.45);
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: rgba(232, 236, 244, 0.05);
  color: var(--text);
  font-size: 0.82rem;
}

.chip-live {
  border-color: rgba(61, 220, 151, 0.4);
  color: var(--success);
}

.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--success);
  box-shadow: 0 0 0 0 rgba(61, 220, 151, 0.6);
  animation: dot-pulse 2s infinite;
}

@keyframes dot-pulse {
  70% {
    box-shadow: 0 0 0 10px rgba(61, 220, 151, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(61, 220, 151, 0);
  }
}

.gradient-text {
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 10: `index.html`, favicon y `.env`**

`index.html`:

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Miguel Ángel Domínguez García · Web Developer</title>
    <meta
      name="description"
      content="Portfolio de Miguel Ángel Domínguez García, Web Developer Full Stack en Jaén. React, Node.js, Java y Spring Boot."
    />
    <meta name="theme-color" content="#07080d" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="canonical" href="%VITE_SITE_URL%/" />

    <meta property="og:type" content="website" />
    <meta property="og:title" content="Miguel Ángel Domínguez García · Web Developer" />
    <meta
      property="og:description"
      content="Web Developer Full Stack en Jaén. Echa un vistazo a mi escritorio en 3D, mi experiencia y mis proyectos."
    />
    <meta property="og:url" content="%VITE_SITE_URL%/" />
    <meta property="og:image" content="%VITE_SITE_URL%/img/og-image.jpg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:locale" content="es_ES" />
    <meta property="og:locale:alternate" content="en_GB" />
    <meta name="twitter:card" content="summary_large_image" />

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="preconnect" href="https://api.fontshare.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
    />
    <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=clash-display@500,600,700&display=swap" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

`public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#07080d"/><path d="M14 46V18h6l12 15 12-15h6v28h-7V30L32 43 21 30v16z" fill="#00e5ff"/></svg>
```

`.env` (URL pública del portfolio; **confirmar con Miguel antes de ejecutar esta tarea**):

```
VITE_SITE_URL=https://mdomgar-portfolio.vercel.app
```

- [ ] **Step 11: `main.jsx` y `App.jsx` nuevos**

`src/main.jsx`:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'lenis/dist/lenis.css'
import './styles/tokens.css'
import './styles/global.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

`src/App.jsx`:

```jsx
import Navbar from './components/Navbar'

export default function App() {
  return (
    <>
      <Navbar />
      <main id="main"></main>
    </>
  )
}
```

- [ ] **Step 12: Borrar el código antiguo**

```bash
git rm src/App.css src/index.css src/assets/react.svg public/vite.svg
git rm src/components/AboutMe.jsx src/components/ContactMe.jsx src/components/Education.jsx src/components/Experience.jsx src/components/Header.jsx src/components/Projects.jsx src/components/Skills.jsx src/components/Stars.jsx
git rm src/components/css/AboutMe.css src/components/css/ContactMe.css src/components/css/Education.css src/components/css/Experience.css src/components/css/Header.css src/components/css/Projects.css src/components/css/Skills.css
```

- [ ] **Step 13: Verificar**

Run: `npm test && npm run lint && npm run build`
Expected: tests PASS, lint sin errores, build OK (la web solo muestra la navbar; es lo esperado).

- [ ] **Step 14: Commit**

```bash
git add -A src index.html public/favicon.svg .env
git commit -m "Replace old layout with new shell, design tokens, SEO head and navbar"
```

---

### Task 3: Base de movimiento (reduced motion, Lenis, sección activa, Reveal)

**Files:**
- Create: `src/lib/gsap.js`, `src/hooks/useReducedMotion.js`, `src/hooks/useSmoothScroll.js`, `src/hooks/useActiveSection.js`, `src/components/Reveal.jsx`, `src/components/SectionHeading.jsx`
- Test: `src/hooks/useReducedMotion.test.js`, `src/hooks/useActiveSection.test.jsx`, `src/components/Reveal.test.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `useSceneStore.setSection`, `SECTION_IDS`, mocks de test (Tasks 1–2)
- Produces:
  - `gsap`, `ScrollTrigger`, `useGSAP` registrados, desde `src/lib/gsap.js`
  - `useReducedMotion()` → boolean (reactivo)
  - `useSmoothScroll(enabled: boolean)` → void (Lenis + ScrollTrigger)
  - `useActiveSection(ids: string[])` → void (escribe `section` en el store)
  - `<Reveal as? className? stagger? y? ...rest>` anima sus hijos al entrar en pantalla
  - `<SectionHeading id eyebrow title />`

- [ ] **Step 1: Tests (fallan)**

`src/hooks/useReducedMotion.test.js`:

```js
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { mockMatchMedia } from '../test/mocks'
import { useReducedMotion } from './useReducedMotion'

describe('useReducedMotion', () => {
  it('reads the current preference', () => {
    mockMatchMedia((query) => query === '(prefers-reduced-motion: reduce)')
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(true)
  })

  it('reacts when the preference changes', () => {
    let reduce = false
    const media = mockMatchMedia(() => reduce)
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(false)
    reduce = true
    act(() => media.emit(true))
    expect(result.current).toBe(true)
  })
})
```

`src/hooks/useActiveSection.test.jsx`:

```jsx
import { act, render } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MockIntersectionObserver } from '../test/mocks'
import { useSceneStore } from '../store/sceneStore'
import { useActiveSection } from './useActiveSection'

function Page() {
  useActiveSection(['hero', 'about'])
  return (
    <>
      <section id="hero" />
      <section id="about" />
    </>
  )
}

beforeEach(() => {
  useSceneStore.setState(useSceneStore.getInitialState(), true)
})

describe('useActiveSection', () => {
  it('observes every section on a thin band in the middle of the viewport', () => {
    render(<Page />)
    const [observer] = MockIntersectionObserver.instances
    expect(observer.elements.size).toBe(2)
    expect(observer.options.rootMargin).toBe('-45% 0px -50% 0px')
  })

  it('stores the section that crosses the band', () => {
    render(<Page />)
    const [observer] = MockIntersectionObserver.instances
    act(() => observer.trigger([{ isIntersecting: true, target: document.getElementById('about') }]))
    expect(useSceneStore.getState().section).toBe('about')
  })

  it('ignores sections that leave the band', () => {
    render(<Page />)
    const [observer] = MockIntersectionObserver.instances
    act(() => observer.trigger([{ isIntersecting: false, target: document.getElementById('about') }]))
    expect(useSceneStore.getState().section).toBe('hero')
  })
})
```

`src/components/Reveal.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { mockMatchMedia } from '../test/mocks'
import Reveal from './Reveal'

describe('Reveal', () => {
  it('renders its children visible when motion is reduced', () => {
    mockMatchMedia((query) => query === '(prefers-reduced-motion: reduce)')
    render(
      <Reveal as="ul" className="list">
        <li>Uno</li>
      </Reveal>,
    )
    const item = screen.getByText('Uno')
    expect(item.parentElement.tagName).toBe('UL')
    expect(item.parentElement).toHaveClass('list')
    expect(item).not.toHaveStyle({ opacity: '0' })
  })
})
```

- [ ] **Step 2: Ejecutar** — Run: `npx vitest run src/hooks src/components/Reveal.test.jsx` → Expected: FAIL (módulos no existen).

- [ ] **Step 3: Implementar**

`src/lib/gsap.js`:

```js
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export { gsap, ScrollTrigger, useGSAP }
```

`src/hooks/useReducedMotion.js`:

```js
import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(callback) {
  const media = window.matchMedia(QUERY)
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}

const getSnapshot = () => window.matchMedia(QUERY).matches
const getServerSnapshot = () => false

export function useReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
```

`src/hooks/useActiveSection.js`:

```js
import { useEffect } from 'react'
import { useSceneStore } from '../store/sceneStore'

export function useActiveSection(ids) {
  const setSection = useSceneStore((state) => state.setSection)
  const key = ids.join('|')

  useEffect(() => {
    const elements = key
      .split('|')
      .map((id) => document.getElementById(id))
      .filter(Boolean)
    if (elements.length === 0) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setSection(entry.target.id)
        }
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    )
    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [key, setSection])
}
```

`src/hooks/useSmoothScroll.js`:

```js
import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '../lib/gsap'

export function useSmoothScroll(enabled) {
  useEffect(() => {
    if (!enabled) return undefined
    const offset = -parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || -72
    const lenis = new Lenis({ anchors: { offset }, lerp: 0.1 })
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [enabled])
}
```

`src/components/Reveal.jsx`:

```jsx
import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { useReducedMotion } from '../hooks/useReducedMotion'

export default function Reveal({ as: Tag = 'div', children, stagger = 0.08, y = 32, ...rest }) {
  const ref = useRef(null)
  const reducedMotion = useReducedMotion()

  useGSAP(
    () => {
      if (reducedMotion) return
      gsap.from(ref.current.children, {
        y,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger,
        scrollTrigger: { trigger: ref.current, start: 'top 82%', once: true },
      })
    },
    { scope: ref, dependencies: [reducedMotion] },
  )

  return (
    <Tag ref={ref} {...rest}>
      {children}
    </Tag>
  )
}
```

`src/components/SectionHeading.jsx`:

```jsx
export default function SectionHeading({ id, eyebrow, title }) {
  return (
    <header className="section-heading">
      <span className="section-eyebrow" aria-hidden="true">
        {eyebrow}
      </span>
      <h2 id={id}>{title}</h2>
    </header>
  )
}
```

- [ ] **Step 4: Ejecutar** — Run: `npx vitest run src/hooks src/components/Reveal.test.jsx` → Expected: PASS (6 tests).

- [ ] **Step 5: Conectar en `App.jsx`**

```jsx
import Navbar from './components/Navbar'
import { useReducedMotion } from './hooks/useReducedMotion'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import { useActiveSection } from './hooks/useActiveSection'
import { SECTION_IDS } from './data/sections'

export default function App() {
  const reducedMotion = useReducedMotion()
  useSmoothScroll(!reducedMotion)
  useActiveSection(SECTION_IDS)

  return (
    <>
      <Navbar />
      <main id="main"></main>
    </>
  )
}
```

(En la Tarea 9 `useSmoothScroll` pasa a depender también de `ready`.)

- [ ] **Step 6: Verificar y commit**

Run: `npm test && npm run lint`
Expected: PASS y sin errores.

```bash
git add src/lib src/hooks src/components/Reveal.jsx src/components/Reveal.test.jsx src/components/SectionHeading.jsx src/App.jsx
git commit -m "Add motion foundation: reduced motion, smooth scroll, active section, reveal"
```

---

### Task 4: Niveles de calidad del 3D

**Files:**
- Create: `src/scene/quality.js`, `src/scene/useQualityTier.js`
- Test: `src/scene/quality.test.js`
- Modify: `src/main.jsx`

**Interfaces:**
- Consumes: `useSceneStore.setTier`
- Produces:
  - `detectTier({ webgl, cores, memory, width, saveData, forced }) → 'static'|'low'|'medium'|'high'`
  - `readDeviceInfo() → { webgl, cores, memory, width, saveData, forced }` (`forced` viene de `?scene=`)
  - `hasWebGL() → boolean`
  - `TIER_SETTINGS: { high|medium|low: { dpr, shadows:boolean, bloom:boolean, sparkles:number } }`
  - `useQualityTier() → tier` (además pone `data-scene="live|static"` en `<html>`)

- [ ] **Step 1: Test (falla)** — `src/scene/quality.test.js`:

```js
import { describe, expect, it } from 'vitest'
import { detectTier, TIER_SETTINGS } from './quality'

const desktop = { webgl: true, cores: 8, memory: 8, width: 1440, saveData: false, forced: null }

describe('detectTier', () => {
  it('uses the full scene on a capable desktop', () => {
    expect(detectTier(desktop)).toBe('high')
  })

  it('falls back to the static scene without WebGL', () => {
    expect(detectTier({ ...desktop, webgl: false })).toBe('static')
  })

  it('respects data saver', () => {
    expect(detectTier({ ...desktop, saveData: true })).toBe('static')
  })

  it('lowers quality on weak desktops', () => {
    expect(detectTier({ ...desktop, cores: 4 })).toBe('medium')
    expect(detectTier({ ...desktop, memory: 4 })).toBe('medium')
  })

  it('uses the light scene on capable phones and the static one on weak phones', () => {
    expect(detectTier({ ...desktop, width: 390 })).toBe('low')
    expect(detectTier({ ...desktop, width: 390, memory: 3 })).toBe('static')
  })

  it('honours a valid ?scene= override and ignores invalid ones', () => {
    expect(detectTier({ ...desktop, forced: 'static' })).toBe('static')
    expect(detectTier({ ...desktop, webgl: false, forced: 'high' })).toBe('static')
    expect(detectTier({ ...desktop, forced: 'ultra' })).toBe('high')
  })

  it('defines settings for every live tier', () => {
    expect(Object.keys(TIER_SETTINGS)).toEqual(['high', 'medium', 'low'])
  })
})
```

- [ ] **Step 2: Ejecutar** — Run: `npx vitest run src/scene/quality.test.js` → Expected: FAIL.

- [ ] **Step 3: Implementar** — `src/scene/quality.js`:

```js
const VALID_TIERS = ['static', 'low', 'medium', 'high']

export const TIER_SETTINGS = {
  high: { dpr: [1, 2], shadows: true, bloom: true, sparkles: 60 },
  medium: { dpr: [1, 1.5], shadows: false, bloom: true, sparkles: 40 },
  low: { dpr: 1, shadows: false, bloom: false, sparkles: 20 },
}

export function hasWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

export function readDeviceInfo() {
  const nav = window.navigator
  return {
    webgl: hasWebGL(),
    cores: nav.hardwareConcurrency ?? 4,
    memory: nav.deviceMemory ?? 8,
    width: window.innerWidth,
    saveData: Boolean(nav.connection?.saveData),
    forced: new URLSearchParams(window.location.search).get('scene'),
  }
}

export function detectTier({ webgl, cores, memory, width, saveData, forced }) {
  if (!webgl) return 'static'
  if (VALID_TIERS.includes(forced)) return forced
  if (saveData) return 'static'
  const weak = cores <= 4 || memory <= 4
  if (width < 768) return weak ? 'static' : 'low'
  return weak ? 'medium' : 'high'
}
```

`src/scene/useQualityTier.js`:

```js
import { useEffect } from 'react'
import { useSceneStore } from '../store/sceneStore'

export function useQualityTier() {
  const tier = useSceneStore((state) => state.tier)

  useEffect(() => {
    if (tier) document.documentElement.dataset.scene = tier === 'static' ? 'static' : 'live'
  }, [tier])

  return tier
}
```

- [ ] **Step 4: Detectar el tier antes de renderizar** — en `src/main.jsx`, añadir tras los imports:

```jsx
import { detectTier, readDeviceInfo } from './scene/quality'
import { useSceneStore } from './store/sceneStore'

useSceneStore.getState().setTier(detectTier(readDeviceInfo()))
```

(Se detecta antes del render para que la precarga sepa si tiene que descargar el chunk 3D.)

- [ ] **Step 5: Ejecutar y commit**

Run: `npm test && npm run lint` → Expected: PASS.

```bash
git add src/scene/quality.js src/scene/quality.test.js src/scene/useQualityTier.js src/main.jsx
git commit -m "Detect 3D quality tier with static fallback and ?scene override"
```

---

### Task 5: Recursos de imagen (recorte de la foto, logo y OG)

**Files:**
- Create: `scripts/process-images.py`, `scripts/source/portrait-original.webp`
- Create (generados): `public/img/portrait-1086.webp`, `public/img/portrait-540.webp`, `public/img/solarmetrics-logo.webp`, `public/img/og-image.jpg`
- Modify: `.gitignore`
- Delete: `public/foto-perfil.JPG`, `public/SolarMetrics.png`

**Interfaces:**
- Produces: `/img/portrait-1086.webp` (1086×1448, RGBA), `/img/portrait-540.webp` (540×720), `/img/solarmetrics-logo.webp` (256×256), `/img/og-image.jpg` (1200×630)

- [ ] **Step 1: Copiar la foto original al repo**

```bash
mkdir -p scripts/source
cp "C:/Users/Mikel/AppData/Local/Temp/claude/C--Users-Mikel-Documents-React-portfolio/e7159e28-0e66-403f-b47f-5c36a077c5d2/images/1.webp" scripts/source/portrait-original.webp
```

- [ ] **Step 2: Escribir el script** — `scripts/process-images.py`:

```python
"""Genera las imágenes de public/img a partir de la foto original.

Uso: python scripts/process-images.py scripts/source/portrait-original.webp
Si la foto ya tiene transparencia (p. ej. un PNG de remove.bg) no se ejecuta rembg.
"""

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "img"
BG = (7, 8, 13)
TEXT = (232, 236, 244)
MUTED = (138, 147, 166)
ACCENT = (0, 229, 255)


def load_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except OSError:
        return ImageFont.load_default(size=size)


def cutout(src):
    img = Image.open(src)
    if img.mode == "RGBA" and img.getextrema()[3][0] < 255:
        return img
    from rembg import new_session, remove

    session = new_session("u2net_human_seg")
    return remove(img.convert("RGB"), session=session, alpha_matting=True)


def save_portraits(cut):
    cut.save(OUT / "portrait-1086.webp", "WEBP", quality=82, method=6)
    small = cut.resize((540, round(cut.height * 540 / cut.width)), Image.LANCZOS)
    small.save(OUT / "portrait-540.webp", "WEBP", quality=80, method=6)


def save_logo():
    logo = Image.open(ROOT / "public" / "SolarMetrics.png").convert("RGBA")
    logo.resize((256, 256), Image.LANCZOS).save(OUT / "solarmetrics-logo.webp", "WEBP", quality=85, method=6)


def save_og(cut):
    width, height = 1200, 630
    glow = Image.new("RGB", (width, height), BG)
    draw = ImageDraw.Draw(glow)
    draw.ellipse((720, 20, 1240, 660), fill=(0, 72, 92))
    draw.ellipse((520, 280, 920, 720), fill=(44, 30, 96))
    canvas = glow.filter(ImageFilter.GaussianBlur(120))

    person_h = 600
    person = cut.resize((round(cut.width * person_h / cut.height), person_h), Image.LANCZOS)
    canvas.paste(person, (width - person.width - 40, height - person_h), person)

    draw = ImageDraw.Draw(canvas)
    bold = load_font("C:/Windows/Fonts/segoeuib.ttf", 64)
    regular = load_font("C:/Windows/Fonts/segoeui.ttf", 34)
    draw.text((70, 190), "Miguel Ángel", font=bold, fill=TEXT)
    draw.text((70, 265), "Domínguez García", font=bold, fill=TEXT)
    draw.text((70, 365), "Web Developer · Full Stack", font=regular, fill=ACCENT)
    draw.text((70, 415), "Jaén, España", font=regular, fill=MUTED)
    canvas.save(OUT / "og-image.jpg", "JPEG", quality=85, optimize=True)


def main():
    if len(sys.argv) != 2:
        sys.exit("Uso: python scripts/process-images.py <foto>")
    OUT.mkdir(parents=True, exist_ok=True)
    cut = cutout(Path(sys.argv[1]))
    save_portraits(cut)
    save_logo()
    save_og(cut)
    for file in sorted(OUT.iterdir()):
        with Image.open(file) as img:
            print(f"{file.name}: {img.size[0]}x{img.size[1]}, {file.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
```

- [ ] **Step 3: Entorno Python aislado**

Añadir a `.gitignore`:

```
# Entorno del script de imágenes
scripts/.venv/
```

**Antes de seguir, preguntar a Miguel**: "Voy a instalar `rembg` y `Pillow` en `scripts/.venv` y, al ejecutarlo por primera vez, rembg descargará su modelo `u2net_human_seg` (~170 MB) desde GitHub. ¿Te parece bien? Si no, quita el fondo en remove.bg, pásame el PNG y lo uso directamente." Si Miguel prefiere remove.bg, usar su PNG como argumento en el Step 4 y saltarse la instalación de rembg.

```bash
python -m venv scripts/.venv
scripts/.venv/Scripts/python -m pip install "rembg[cpu]" pillow
```

- [ ] **Step 4: Generar las imágenes**

Run: `scripts/.venv/Scripts/python scripts/process-images.py scripts/source/portrait-original.webp`
Expected (tamaños aproximados):

```
og-image.jpg: 1200x630, ~80 KB
portrait-1086.webp: 1086x1448, ~120 KB
portrait-540.webp: 540x720, ~40 KB
solarmetrics-logo.webp: 256x256, ~15 KB
```

Abrir `public/img/portrait-1086.webp` y `public/img/og-image.jpg` con la herramienta Read y comprobar que el recorte es limpio (pelo, hombros, manos). Si el borde deja halos blancos, repetir sin `alpha_matting` o probar el modelo `isnet-general-use`.

- [ ] **Step 5: Borrar las imágenes antiguas y commit**

```bash
git rm public/foto-perfil.JPG public/SolarMetrics.png
git add scripts/process-images.py scripts/source/portrait-original.webp public/img .gitignore
git commit -m "Add image pipeline: transparent portrait, project logo and OG image"
```

---

### Task 6: Escena 3D base (capa, canvas, cámara, luces, sala y mesa)

**Files:**
- Create: `src/scene/layout.js`, `src/scene/cameraPoses.js`, `src/scene/loadScene.js`, `src/scene/SceneLayer.jsx`, `src/scene/SceneCanvas.jsx`, `src/scene/SceneErrorBoundary.jsx`, `src/scene/SceneFallback.jsx`, `src/scene/CameraRig.jsx`, `src/scene/Lights.jsx`, `src/scene/Room.jsx`, `src/scene/Desk.jsx`, `src/scene/Effects.jsx`, `src/scene/scene.css`
- Test: `src/scene/cameraPoses.test.js`, `src/scene/SceneLayer.test.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `useSceneStore` (`section`, `tier`, `setTier`, `downgrade`, `lampOn`), `TIER_SETTINGS`, `useQualityTier`
- Produces:
  - `layout.js`: `DESK = { width: 2.4, depth: 0.9, height: 0.75, top: 0.04 }`, `DESK_TOP = 0.75`, `MAIN_SCREEN = { position: [0, 1.12, -0.22], size: [1.06, 0.38] }`, `SIDE_SCREEN = { position: [0.95, 1.16, -0.18], rotationY: -0.45, size: [0.34, 0.6] }`, `LAMP_HEAD = [-0.64, 1.22, -0.22]`
  - `cameraPoses.js`: `CAMERA_POSES`, `DIMMED_SECTIONS: Set`, `getPose(section)`, `dampVec3(current: Vector3, target: [x,y,z], lambda, delta)`
  - `loadScene()` → `Promise<module>` (import dinámico de `SceneCanvas`)
  - `<SceneLayer reducedMotion />`; `<SceneCanvas tier reducedMotion />` (default export, lazy)

- [ ] **Step 1: Tests (fallan)**

`src/scene/cameraPoses.test.js`:

```js
import { describe, expect, it } from 'vitest'
import { Vector3 } from 'three'
import { CAMERA_POSES, dampVec3, getPose } from './cameraPoses'
import { SECTION_IDS } from '../data/sections'

describe('camera poses', () => {
  it('defines a pose for every section', () => {
    for (const id of SECTION_IDS) expect(CAMERA_POSES[id], id).toBeDefined()
  })

  it('falls back to the hero pose for unknown sections', () => {
    expect(getPose('nope')).toBe(CAMERA_POSES.hero)
  })

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

`src/scene/SceneLayer.test.jsx`:

```jsx
import { act, render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SceneLayer from './SceneLayer'
import SceneErrorBoundary from './SceneErrorBoundary'
import { useSceneStore } from '../store/sceneStore'

beforeEach(() => {
  useSceneStore.setState(useSceneStore.getInitialState(), true)
})

describe('SceneLayer', () => {
  it('renders nothing until the tier is known', () => {
    const { container } = render(<SceneLayer reducedMotion={false} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows the static fallback instead of WebGL on the static tier', () => {
    act(() => useSceneStore.getState().setTier('static'))
    const { container } = render(<SceneLayer reducedMotion={false} />)
    expect(container.querySelector('.scene-fallback')).toBeInTheDocument()
    expect(container.querySelector('canvas')).not.toBeInTheDocument()
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('dims the scene behind text-heavy sections', () => {
    act(() => {
      useSceneStore.getState().setTier('static')
      useSceneStore.getState().setSection('experience')
    })
    const { container } = render(<SceneLayer reducedMotion={false} />)
    expect(container.firstChild).toHaveAttribute('data-dimmed', 'true')
  })
})

describe('SceneErrorBoundary', () => {
  it('shows the fallback and reports when the scene crashes', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const onError = vi.fn()
    const Broken = () => {
      throw new Error('WebGL context lost')
    }
    const { getByText } = render(
      <SceneErrorBoundary fallback={<p>fallback</p>} onError={onError}>
        <Broken />
      </SceneErrorBoundary>,
    )
    expect(getByText('fallback')).toBeInTheDocument()
    expect(onError).toHaveBeenCalledTimes(1)
    vi.restoreAllMocks()
  })
})
```

- [ ] **Step 2: Ejecutar** — Run: `npx vitest run src/scene` → Expected: FAIL (módulos nuevos no existen).

- [ ] **Step 3: Módulos puros**

`src/scene/layout.js`:

```js
export const DESK = { width: 2.4, depth: 0.9, height: 0.75, top: 0.04 }
export const DESK_TOP = DESK.height
export const MAIN_SCREEN = { position: [0, 1.12, -0.22], size: [1.06, 0.38] }
export const SIDE_SCREEN = { position: [0.95, 1.16, -0.18], rotationY: -0.45, size: [0.34, 0.6] }
export const LAMP_HEAD = [-0.64, 1.22, -0.22]
```

`src/scene/cameraPoses.js`:

```js
import { MathUtils } from 'three'

export const CAMERA_POSES = {
  hero: { position: [1.1, 1.55, 3.4], target: [0.2, 1.0, 0] },
  about: { position: [-2.6, 1.9, 2.4], target: [0, 0.95, 0] },
  experience: { position: [2.4, 2.3, 2.8], target: [0, 0.9, 0] },
  projects: { position: [-0.45, 1.14, 1.4], target: [-0.45, 1.14, -0.22] },
  education: { position: [2.8, 1.5, 1.4], target: [0, 1.0, 0] },
  contact: { position: [0, 2.6, 5.4], target: [0, 0.9, 0] },
}

export const DIMMED_SECTIONS = new Set(['experience', 'education'])

export function getPose(section) {
  return CAMERA_POSES[section] ?? CAMERA_POSES.hero
}

export function dampVec3(current, target, lambda, delta) {
  current.x = MathUtils.damp(current.x, target[0], lambda, delta)
  current.y = MathUtils.damp(current.y, target[1], lambda, delta)
  current.z = MathUtils.damp(current.z, target[2], lambda, delta)
  return current
}
```

`src/scene/loadScene.js`:

```js
export const loadScene = () => import('./SceneCanvas')
```

- [ ] **Step 4: Capa, fallback y boundary**

`src/scene/SceneErrorBoundary.jsx`:

```jsx
import { Component } from 'react'

export default class SceneErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    this.props.onError?.(error)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
```

`src/scene/SceneFallback.jsx`:

```jsx
export default function SceneFallback() {
  return <div className="scene-fallback" />
}
```

`src/scene/SceneLayer.jsx`:

```jsx
import { lazy, Suspense } from 'react'
import { useSceneStore } from '../store/sceneStore'
import { DIMMED_SECTIONS } from './cameraPoses'
import { loadScene } from './loadScene'
import SceneErrorBoundary from './SceneErrorBoundary'
import SceneFallback from './SceneFallback'
import './scene.css'

const SceneCanvas = lazy(loadScene)

export default function SceneLayer({ reducedMotion }) {
  const tier = useSceneStore((state) => state.tier)
  const dimmed = useSceneStore((state) => DIMMED_SECTIONS.has(state.section))
  const setTier = useSceneStore((state) => state.setTier)

  if (!tier) return null

  return (
    <div className="scene-layer" data-dimmed={dimmed} aria-hidden="true">
      {tier === 'static' ? (
        <SceneFallback />
      ) : (
        <SceneErrorBoundary fallback={<SceneFallback />} onError={() => setTier('static')}>
          <Suspense fallback={<SceneFallback />}>
            <SceneCanvas tier={tier} reducedMotion={reducedMotion} />
          </Suspense>
        </SceneErrorBoundary>
      )}
    </div>
  )
}
```

`src/scene/scene.css`:

```css
.scene-layer {
  position: fixed;
  inset: 0;
  z-index: 0;
  transition: opacity 0.8s var(--ease-out), filter 0.8s var(--ease-out);
}

.scene-layer[data-dimmed='true'] {
  opacity: 0.35;
  filter: saturate(0.8);
}

.scene-canvas {
  width: 100%;
  height: 100%;
}

.scene-fallback {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background:
    radial-gradient(55% 45% at 72% 38%, rgba(0, 229, 255, 0.16), transparent 70%),
    radial-gradient(45% 40% at 28% 72%, rgba(124, 92, 255, 0.2), transparent 70%),
    var(--bg);
}

.scene-fallback::after {
  content: '';
  position: absolute;
  left: -50%;
  right: -50%;
  bottom: -10%;
  height: 55%;
  background-image:
    linear-gradient(rgba(0, 229, 255, 0.14) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 229, 255, 0.14) 1px, transparent 1px);
  background-size: 60px 60px;
  transform: perspective(500px) rotateX(62deg);
  transform-origin: top;
  -webkit-mask-image: linear-gradient(to bottom, transparent, #000 40%);
  mask-image: linear-gradient(to bottom, transparent, #000 40%);
}
```

- [ ] **Step 5: No ejecutar todavía** — Vite resuelve el `import('./SceneCanvas')` al transformar `loadScene.js`, así que los tests de esta tarea se ejecutan en el Step 8, cuando `SceneCanvas.jsx` ya existe.

- [ ] **Step 6: Canvas, cámara, luces, sala y mesa**

`src/scene/CameraRig.jsx`:

```jsx
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { useSceneStore } from '../store/sceneStore'
import { dampVec3, getPose } from './cameraPoses'

export default function CameraRig({ reducedMotion }) {
  const camera = useThree((state) => state.camera)
  const lookAt = useRef(new Vector3(...getPose('hero').target))

  useFrame((state, delta) => {
    const pose = getPose(reducedMotion ? 'hero' : useSceneStore.getState().section)
    const px = reducedMotion ? 0 : state.pointer.x * 0.18
    const py = reducedMotion ? 0 : state.pointer.y * 0.1
    const lambda = reducedMotion ? 1000 : 2.2
    dampVec3(camera.position, [pose.position[0] + px, pose.position[1] + py, pose.position[2]], lambda, delta)
    dampVec3(lookAt.current, pose.target, lambda, delta)
    camera.lookAt(lookAt.current)
  })

  return null
}
```

`src/scene/Lights.jsx`:

```jsx
import { useState } from 'react'
import { Object3D } from 'three'
import { useSceneStore } from '../store/sceneStore'
import { LAMP_HEAD } from './layout'

export default function Lights({ shadows }) {
  const lampOn = useSceneStore((state) => state.lampOn)
  const [lampTarget] = useState(() => new Object3D())

  return (
    <>
      <ambientLight intensity={0.35} color="#8fa3ff" />
      <hemisphereLight args={['#1b2440', '#07080d', 0.5]} />
      <primitive object={lampTarget} position={[-0.35, 0.75, 0.1]} />
      <spotLight
        position={LAMP_HEAD}
        target={lampTarget}
        angle={0.8}
        penumbra={0.6}
        intensity={lampOn ? 6 : 0}
        distance={4}
        decay={1.5}
        color="#ffb454"
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-0.6, 0.55, 0.45]} color="#00e5ff" intensity={2.2} distance={2.5} />
      <pointLight position={[0.6, 0.55, 0.45]} color="#7c5cff" intensity={2.2} distance={2.5} />
      <pointLight position={[0, 1.12, 0.25]} color="#7fdcff" intensity={1.2} distance={1.8} />
    </>
  )
}
```

`src/scene/Room.jsx`:

```jsx
export default function Room() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0b0d14" roughness={0.9} />
      </mesh>
      <mesh position={[0, 3, -1.1]} receiveShadow>
        <planeGeometry args={[12, 6]} />
        <meshStandardMaterial color="#0c0f18" roughness={0.95} />
      </mesh>
    </group>
  )
}
```

`src/scene/Desk.jsx`:

```jsx
import { DESK } from './layout'

const WOOD = '#2a1d16'
const METAL = '#1d2230'
const LEG_X = DESK.width / 2 - 0.08
const LEG_Z = DESK.depth / 2 - 0.08
const LEG_HEIGHT = DESK.height - DESK.top
const LEGS = [
  [-LEG_X, -LEG_Z],
  [LEG_X, -LEG_Z],
  [-LEG_X, LEG_Z],
  [LEG_X, LEG_Z],
]

export default function Desk() {
  return (
    <group>
      <mesh position={[0, DESK.height - DESK.top / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[DESK.width, DESK.top, DESK.depth]} />
        <meshStandardMaterial color={WOOD} roughness={0.7} />
      </mesh>
      {LEGS.map(([x, z]) => (
        <mesh key={`${x}:${z}`} position={[x, LEG_HEIGHT / 2, z]} castShadow>
          <boxGeometry args={[0.05, LEG_HEIGHT, 0.05]} />
          <meshStandardMaterial color={METAL} metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[-0.6, LEG_HEIGHT - 0.01, DESK.depth / 2 - 0.02]}>
        <boxGeometry args={[1.2, 0.012, 0.012]} />
        <meshBasicMaterial color="#00e5ff" toneMapped={false} />
      </mesh>
      <mesh position={[0.6, LEG_HEIGHT - 0.01, DESK.depth / 2 - 0.02]}>
        <boxGeometry args={[1.2, 0.012, 0.012]} />
        <meshBasicMaterial color="#7c5cff" toneMapped={false} />
      </mesh>
    </group>
  )
}
```

`src/scene/Effects.jsx`:

```jsx
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'

export default function Effects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur intensity={0.9} luminanceThreshold={0.55} luminanceSmoothing={0.2} />
      <Vignette offset={0.25} darkness={0.75} />
    </EffectComposer>
  )
}
```

`src/scene/SceneCanvas.jsx`:

```jsx
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { useSceneStore } from '../store/sceneStore'
import { getPose } from './cameraPoses'
import { TIER_SETTINGS } from './quality'
import CameraRig from './CameraRig'
import Lights from './Lights'
import Room from './Room'
import Desk from './Desk'
import Effects from './Effects'

export default function SceneCanvas({ tier, reducedMotion }) {
  const settings = TIER_SETTINGS[tier]
  const downgrade = useSceneStore((state) => state.downgrade)
  const setTier = useSceneStore((state) => state.setTier)

  const handleCreated = ({ gl }) => {
    gl.domElement.addEventListener(
      'webglcontextlost',
      (event) => {
        event.preventDefault()
        setTier('static')
      },
      { once: true },
    )
  }

  return (
    <Canvas
      className="scene-canvas"
      dpr={settings.dpr}
      shadows={settings.shadows}
      camera={{ position: getPose('hero').position, fov: 40, near: 0.1, far: 50 }}
      gl={{ antialias: tier !== 'low', powerPreference: 'high-performance' }}
      eventSource={document.getElementById('root')}
      eventPrefix="client"
      onCreated={handleCreated}
    >
      <color attach="background" args={['#07080d']} />
      <fog attach="fog" args={['#07080d', 5, 13]} />
      <PerformanceMonitor onDecline={downgrade} />
      <CameraRig reducedMotion={reducedMotion} />
      <Lights shadows={settings.shadows} />
      <Room />
      <Desk />
      {settings.bloom && <Effects />}
    </Canvas>
  )
}
```

- [ ] **Step 7: Montar la capa en `App.jsx`** — añadir imports y la capa antes de la `Navbar`:

```jsx
import SceneLayer from './scene/SceneLayer'
import { useQualityTier } from './scene/useQualityTier'
```

Dentro de `App()`, tras `useActiveSection(SECTION_IDS)`:

```jsx
useQualityTier()
```

y en el JSX:

```jsx
<>
  <SceneLayer reducedMotion={reducedMotion} />
  <Navbar />
  <main id="main"></main>
</>
```

- [ ] **Step 8: Verificar**

Run: `npx vitest run src/scene` → Expected: PASS (quality, cameraPoses, SceneLayer y SceneErrorBoundary).

Run: `npm test && npm run lint && npm run build`
Expected: PASS. El build genera un chunk separado para `SceneCanvas` (three + fiber).

Arrancar la web con el navegador integrado (crear `.claude/launch.json` si no existe con `{ "version": "0.0.1", "configurations": [{ "name": "portfolio", "runtimeExecutable": "npm", "runtimeArgs": ["run", "dev"], "port": 5173 }] }` y usar `preview_start` con `name: "portfolio"`). Comprobar con una captura que se ve la mesa iluminada con LEDs cian/violeta y niebla, que la cámara se mueve un poco con el ratón y que `?scene=static` muestra el fondo de degradado con rejilla. Revisar la consola: sin errores.

- [ ] **Step 9: Commit**

```bash
git add src/scene src/App.jsx
git commit -m "Add 3D scene layer with camera rig, lights, room, desk and static fallback"
```

---

### Task 7: Pantallas de los monitores (código, terminal y dashboard de SolarMetrics)

**Files:**
- Create: `src/scene/useCanvasTexture.js`, `src/scene/screens/code.js`, `src/scene/screens/terminal.js`, `src/scene/screens/solar.js`, `src/scene/screens/dashboard.js`, `src/scene/Monitors.jsx`
- Test: `src/scene/screens/screens.test.js`
- Modify: `src/scene/SceneCanvas.jsx`

**Interfaces:**
- Consumes: `MAIN_SCREEN`, `SIDE_SCREEN`, `DESK_TOP`, `useSceneStore.section`, `useLang`
- Produces:
  - `useCanvasTexture({ width, height, fps, draw }) → CanvasTexture`; `draw(ctx, time, width, height)`
  - `code.js`: `CODE_LINES: string[]`, `tokenizeLine(line) → Array<{text, type}>` con `type ∈ keyword|string|boolean|key|punct|plain`, `typedLines(lines, chars) → string[]`, `drawCode(ctx, time, w, h, complete)`
  - `terminal.js`: `TERMINAL_LINES`, `drawTerminal(ctx, time, w, h, complete)`
  - `solar.js`: `solarPower(hour, peak = 5.4) → kW`, `energyUntil(hour, peak = 5.4) → kWh`
  - `dashboard.js`: `DASHBOARD_LABELS: { es, en }`, `drawDashboard(ctx, time, w, h, complete = false, labels = DASHBOARD_LABELS.es)`

- [ ] **Step 1: Tests (fallan)** — `src/scene/screens/screens.test.js`:

```js
import { describe, expect, it } from 'vitest'
import { tokenizeLine, typedLines } from './code'
import { energyUntil, solarPower } from './solar'

describe('tokenizeLine', () => {
  it('splits a line into highlighted tokens that rebuild the original text', () => {
    const line = "  role: 'Web Developer',"
    const tokens = tokenizeLine(line)
    expect(tokens.map((t) => t.text).join('')).toBe(line)
    expect(tokens.find((t) => t.text === 'role')).toMatchObject({ type: 'key' })
    expect(tokens.find((t) => t.text === "'Web Developer'")).toMatchObject({ type: 'string' })
  })

  it('highlights keywords and booleans', () => {
    const types = Object.fromEntries(tokenizeLine('const ok = true;').map((t) => [t.text, t.type]))
    expect(types.const).toBe('keyword')
    expect(types.true).toBe('boolean')
  })

  it('treats a half-typed string as a string', () => {
    expect(tokenizeLine("  name: 'Mig").at(-1)).toEqual({ text: "'Mig", type: 'string' })
  })
})

describe('typedLines', () => {
  it('reveals text character by character across lines', () => {
    expect(typedLines(['ab', 'cd'], 0)).toEqual([])
    expect(typedLines(['ab', 'cd'], 1)).toEqual(['a'])
    expect(typedLines(['ab', 'cd'], 4)).toEqual(['ab', 'c'])
    expect(typedLines(['ab', 'cd'], 99)).toEqual(['ab', 'cd'])
  })
})

describe('solar model', () => {
  it('produces nothing at night and peaks at 13:00', () => {
    expect(solarPower(3)).toBe(0)
    expect(solarPower(21)).toBe(0)
    expect(solarPower(13)).toBeCloseTo(5.4, 5)
    expect(solarPower(13)).toBeGreaterThan(solarPower(10))
  })

  it('is symmetric around midday', () => {
    expect(solarPower(9)).toBeCloseTo(solarPower(17), 5)
  })

  it('accumulates energy monotonically through the day', () => {
    expect(energyUntil(6)).toBe(0)
    expect(energyUntil(12)).toBeGreaterThan(energyUntil(9))
    expect(energyUntil(20)).toBeCloseTo(energyUntil(24), 5)
  })
})
```

- [ ] **Step 2: Ejecutar** — Run: `npx vitest run src/scene/screens` → Expected: FAIL.

- [ ] **Step 3: Implementar las pantallas**

`src/scene/screens/solar.js`:

```js
export function solarPower(hour, peak = 5.4) {
  if (hour <= 6 || hour >= 20) return 0
  return peak * Math.pow(Math.sin((Math.PI * (hour - 6)) / 14), 1.6)
}

export function energyUntil(hour, peak = 5.4) {
  const step = 0.05
  let energy = 0
  for (let h = 6; h < Math.min(hour, 20); h += step) {
    energy += ((solarPower(h, peak) + solarPower(h + step, peak)) / 2) * step
  }
  return energy
}
```

`src/scene/screens/code.js`:

```js
export const CODE_LINES = [
  'const developer = {',
  "  name: 'Miguel Ángel',",
  "  role: 'Web Developer',",
  "  stack: ['React', 'Node.js', 'Spring Boot'],",
  "  basedIn: 'Jaén',",
  '  available: true,',
  '};',
  '',
  'export default developer;',
]

const COLORS = {
  keyword: '#7c5cff',
  string: '#ffb454',
  boolean: '#3ddc97',
  key: '#00e5ff',
  punct: '#8a93a6',
  plain: '#e8ecf4',
}

const TOKEN_RE = /('[^']*'?|\b(?:const|export|default|true|false)\b|[A-Za-z_]\w*(?=:)|[{}[\](),;:=.])/g
const TOTAL_CHARS = CODE_LINES.join('\n').length
const CHARS_PER_SECOND = 22
const HOLD_SECONDS = 4

function tokenType(text) {
  if (text.startsWith("'")) return 'string'
  if (/^(const|export|default)$/.test(text)) return 'keyword'
  if (/^(true|false)$/.test(text)) return 'boolean'
  if (/^[A-Za-z_]/.test(text)) return 'key'
  return 'punct'
}

export function tokenizeLine(line) {
  const tokens = []
  let last = 0
  for (const match of line.matchAll(TOKEN_RE)) {
    if (match.index > last) tokens.push({ text: line.slice(last, match.index), type: 'plain' })
    tokens.push({ text: match[0], type: tokenType(match[0]) })
    last = match.index + match[0].length
  }
  if (last < line.length) tokens.push({ text: line.slice(last), type: 'plain' })
  return tokens
}

export function typedLines(lines, chars) {
  const out = []
  let left = chars
  for (const line of lines) {
    if (left <= 0) break
    out.push(line.slice(0, left))
    left -= line.length + 1
  }
  return out
}

export function drawCode(ctx, time, width, height, complete = false) {
  const cycle = TOTAL_CHARS / CHARS_PER_SECOND + HOLD_SECONDS
  const chars = complete ? TOTAL_CHARS : Math.floor((time % cycle) * CHARS_PER_SECOND)

  ctx.fillStyle = '#0a0d16'
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = '#131722'
  ctx.fillRect(0, 0, width, 34)
  ctx.fillStyle = '#e8ecf4'
  ctx.font = '500 16px "JetBrains Mono", monospace'
  ctx.fillText('developer.js', 18, 23)

  ctx.font = '20px "JetBrains Mono", monospace'
  const lines = typedLines(CODE_LINES, chars)
  lines.forEach((line, index) => {
    const y = 70 + index * 30
    ctx.fillStyle = '#3a4256'
    ctx.fillText(String(index + 1).padStart(2, ' '), 18, y)
    let x = 64
    for (const token of tokenizeLine(line)) {
      ctx.fillStyle = COLORS[token.type]
      ctx.fillText(token.text, x, y)
      x += ctx.measureText(token.text).width
    }
    const isLast = index === lines.length - 1
    if (isLast && Math.floor(time * 2) % 2 === 0) {
      ctx.fillStyle = '#00e5ff'
      ctx.fillRect(x + 2, y - 18, 10, 22)
    }
  })
}
```

`src/scene/screens/terminal.js`:

```js
export const TERMINAL_LINES = [
  { text: '$ npm run dev', color: '#e8ecf4' },
  { text: '  VITE v7 ready in 312 ms', color: '#3ddc97' },
  { text: '  ➜ Local: localhost:5173', color: '#00e5ff' },
  { text: '$ git add .', color: '#e8ecf4' },
  { text: '$ git commit -m "feat: 3d desk"', color: '#e8ecf4' },
  { text: '  [redesign-3d] 1 file changed', color: '#8a93a6' },
  { text: '$ npm test', color: '#e8ecf4' },
  { text: '  ✓ all tests passed', color: '#3ddc97' },
]

const SECONDS_PER_LINE = 0.9

export function drawTerminal(ctx, time, width, height, complete = false) {
  const cycleLines = TERMINAL_LINES.length + 3
  const visible = complete
    ? TERMINAL_LINES.length
    : Math.min(TERMINAL_LINES.length, Math.floor(time / SECONDS_PER_LINE) % cycleLines)

  ctx.fillStyle = '#07090f'
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = '#131722'
  ctx.fillRect(0, 0, width, 30)
  ;['#ff5f57', '#febc2e', '#28c840'].forEach((color, index) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(18 + index * 18, 15, 5, 0, Math.PI * 2)
    ctx.fill()
  })

  ctx.font = '17px "JetBrains Mono", monospace'
  TERMINAL_LINES.slice(0, visible).forEach((line, index) => {
    ctx.fillStyle = line.color
    ctx.fillText(line.text, 14, 62 + index * 28)
  })
  if (Math.floor(time * 2) % 2 === 0) {
    ctx.fillStyle = '#00e5ff'
    ctx.fillRect(14, 62 + visible * 28 - 16, 10, 20)
  }
}
```

`src/scene/screens/dashboard.js`:

```js
import { energyUntil, solarPower } from './solar'

export const DASHBOARD_LABELS = {
  es: { site: 'Planta Jaén · Hoy', power: 'Potencia', energy: 'Energía hoy', efficiency: 'Eficiencia', chart: 'Producción (kW)' },
  en: { site: 'Jaén plant · Today', power: 'Power', energy: 'Energy today', efficiency: 'Efficiency', chart: 'Output (kW)' },
}

const PEAK = 5.4
const LOOP_SECONDS = 12
const DRAW_SECONDS = 5

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  ctx.fill()
}

export function drawDashboard(ctx, time, width, height, complete = false, labels = DASHBOARD_LABELS.es) {
  const progress = complete ? 1 : Math.min(1, (time % LOOP_SECONDS) / DRAW_SECONDS)
  const hourNow = 6 + 14 * progress

  ctx.fillStyle = '#0a0d16'
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = '#131722'
  ctx.fillRect(0, 0, width, 40)
  ctx.fillStyle = '#ffb454'
  ctx.beginPath()
  ctx.arc(22, 20, 8, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#e8ecf4'
  ctx.font = '600 17px Inter, sans-serif'
  ctx.fillText('SolarMetrics', 40, 26)
  ctx.fillStyle = '#8a93a6'
  ctx.font = '14px Inter, sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText(labels.site, width - 18, 26)
  ctx.textAlign = 'left'

  const kpis = [
    [labels.power, `${solarPower(hourNow, PEAK).toFixed(1)} kW`, '#00e5ff'],
    [labels.energy, `${energyUntil(hourNow, PEAK).toFixed(1)} kWh`, '#3ddc97'],
    [labels.efficiency, `${(17.6 + Math.sin(time) * 0.4).toFixed(1)} %`, '#ffb454'],
  ]
  kpis.forEach(([label, value, color], index) => {
    const y = 52 + index * 98
    ctx.fillStyle = '#131722'
    roundRect(ctx, 16, y, 220, 90, 10)
    ctx.fillStyle = '#8a93a6'
    ctx.font = '14px Inter, sans-serif'
    ctx.fillText(label, 32, y + 30)
    ctx.fillStyle = color
    ctx.font = '600 28px Inter, sans-serif'
    ctx.fillText(value, 32, y + 68)
  })

  const chart = { x: 252, y: 52, w: width - 268, h: height - 68 }
  ctx.fillStyle = '#131722'
  roundRect(ctx, chart.x, chart.y, chart.w, chart.h, 10)
  ctx.fillStyle = '#8a93a6'
  ctx.font = '14px Inter, sans-serif'
  ctx.fillText(labels.chart, chart.x + 16, chart.y + 26)

  const plot = { x: chart.x + 44, y: chart.y + 44, w: chart.w - 64, h: chart.h - 80 }
  const toX = (hour) => plot.x + ((hour - 6) / 14) * plot.w
  const toY = (kw) => plot.y + plot.h - (kw / (PEAK * 1.1)) * plot.h

  ctx.strokeStyle = 'rgba(232,236,244,0.08)'
  ctx.lineWidth = 1
  for (let i = 0; i <= 4; i += 1) {
    const y = plot.y + (plot.h / 4) * i
    ctx.beginPath()
    ctx.moveTo(plot.x, y)
    ctx.lineTo(plot.x + plot.w, y)
    ctx.stroke()
  }
  ctx.fillStyle = '#5c6478'
  ctx.font = '12px "JetBrains Mono", monospace'
  for (let hour = 6; hour <= 20; hour += 2) ctx.fillText(`${hour}h`, toX(hour) - 10, plot.y + plot.h + 20)

  const gradient = ctx.createLinearGradient(0, plot.y, 0, plot.y + plot.h)
  gradient.addColorStop(0, 'rgba(0,229,255,0.35)')
  gradient.addColorStop(1, 'rgba(0,229,255,0)')
  ctx.beginPath()
  ctx.moveTo(toX(6), toY(0))
  for (let hour = 6; hour <= hourNow; hour += 0.1) ctx.lineTo(toX(hour), toY(solarPower(hour, PEAK)))
  ctx.lineTo(toX(hourNow), toY(0))
  ctx.closePath()
  ctx.fillStyle = gradient
  ctx.fill()

  ctx.beginPath()
  for (let hour = 6; hour <= hourNow; hour += 0.1) ctx.lineTo(toX(hour), toY(solarPower(hour, PEAK)))
  ctx.strokeStyle = '#00e5ff'
  ctx.lineWidth = 3
  ctx.stroke()

  ctx.fillStyle = '#e8ecf4'
  ctx.beginPath()
  ctx.arc(toX(hourNow), toY(solarPower(hourNow, PEAK)), 5, 0, Math.PI * 2)
  ctx.fill()
}
```

- [ ] **Step 4: Ejecutar** — Run: `npx vitest run src/scene/screens` → Expected: PASS (7 tests).

- [ ] **Step 5: Textura de canvas y monitores**

`src/scene/useCanvasTexture.js`:

```js
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, SRGBColorSpace } from 'three'

export function useCanvasTexture({ width, height, fps = 20, draw }) {
  const canvas = useMemo(() => {
    const element = document.createElement('canvas')
    element.width = width
    element.height = height
    return element
  }, [width, height])

  const texture = useMemo(() => {
    const tex = new CanvasTexture(canvas)
    tex.colorSpace = SRGBColorSpace
    tex.anisotropy = 4
    return tex
  }, [canvas])

  const drawRef = useRef(draw)
  const elapsed = useRef(Infinity)

  useLayoutEffect(() => {
    drawRef.current = draw
  }, [draw])

  useEffect(() => () => texture.dispose(), [texture])

  useFrame((state, delta) => {
    elapsed.current += delta
    if (elapsed.current < 1 / fps) return
    elapsed.current = 0
    drawRef.current(canvas.getContext('2d'), state.clock.elapsedTime, width, height)
    texture.needsUpdate = true
  })

  return texture
}
```

(`elapsed` empieza en `Infinity` para que el primer frame ya pinte la pantalla.)

`src/scene/Monitors.jsx`:

```jsx
import { useSceneStore } from '../store/sceneStore'
import { useLang } from '../i18n/useLang'
import { useCanvasTexture } from './useCanvasTexture'
import { DESK_TOP, MAIN_SCREEN, SIDE_SCREEN } from './layout'
import { drawCode } from './screens/code'
import { drawTerminal } from './screens/terminal'
import { DASHBOARD_LABELS, drawDashboard } from './screens/dashboard'

const BEZEL = '#0d1017'
const STAND = '#1d2230'

function Screen({ size, texture, bezel = 0.02 }) {
  const [w, h] = size
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[w + bezel * 2, h + bezel * 2, 0.03]} />
        <meshStandardMaterial color={BEZEL} roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.016]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  )
}

function Stand({ height, depthOffset = -0.05 }) {
  return (
    <group>
      <mesh position={[0, -height / 2, depthOffset]}>
        <boxGeometry args={[0.05, height, 0.04]} />
        <meshStandardMaterial color={STAND} metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, -height + 0.008, depthOffset]}>
        <boxGeometry args={[0.3, 0.016, 0.18]} />
        <meshStandardMaterial color={STAND} metalness={0.6} roughness={0.35} />
      </mesh>
    </group>
  )
}

export default function Monitors({ reducedMotion }) {
  const lang = useLang()
  const showDashboard = useSceneStore((state) => state.section === 'projects')

  const main = useCanvasTexture({
    width: 1024,
    height: 368,
    fps: 24,
    draw: (ctx, time, w, h) =>
      showDashboard
        ? drawDashboard(ctx, time, w, h, reducedMotion, DASHBOARD_LABELS[lang])
        : drawCode(ctx, time, w, h, reducedMotion),
  })
  const side = useCanvasTexture({
    width: 384,
    height: 680,
    fps: 8,
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

- [ ] **Step 6: Añadir monitores a la escena** — en `SceneCanvas.jsx` importar `Monitors` y renderizar `<Monitors reducedMotion={reducedMotion} />` justo después de `<Desk />`.

- [ ] **Step 7: Verificar**

Run: `npm test && npm run lint`
Expected: PASS.

En el navegador integrado: el monitor ancho teclea `developer.js` con resaltado de sintaxis y cursor parpadeante, y el vertical muestra la terminal línea a línea. El cambio al dashboard se comprueba en la Tarea 13, cuando exista la sección de proyectos.

- [ ] **Step 8: Commit**

```bash
git add src/scene
git commit -m "Add animated monitor screens: code editor, terminal and SolarMetrics dashboard"
```

---

### Task 8: Teclado RGB y objetos del escritorio

**Files:**
- Create: `src/scene/Keyboard.jsx`, `src/scene/props/Props.jsx`, `src/scene/props/Mug.jsx`, `src/scene/props/Lamp.jsx`, `src/scene/props/Plants.jsx`, `src/scene/props/Headphones.jsx`, `src/scene/props/Tower.jsx`
- Modify: `src/scene/SceneCanvas.jsx`

**Interfaces:**
- Consumes: `DESK_TOP`, `LAMP_HEAD`, `useSceneStore` (`lampOn`, `toggleLamp`), `TIER_SETTINGS[tier].sparkles`
- Produces: `<Keyboard reducedMotion />`, `<Props reducedMotion sparkles />`

Esta tarea es visual: no hay lógica pura nueva que testear; se verifica con capturas.

- [ ] **Step 1: Teclado** — `src/scene/Keyboard.jsx`:

```jsx
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { Color, Object3D } from 'three'
import { DESK_TOP } from './layout'

const COLS = 15
const ROWS = 5
const KEY = 0.024
const GAP = 0.004
const PITCH = KEY + GAP

export default function Keyboard({ reducedMotion }) {
  const keys = useRef(null)
  const [hovered, setHovered] = useState(false)
  const color = useMemo(() => new Color(), [])

  useLayoutEffect(() => {
    const dummy = new Object3D()
    let i = 0
    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLS; col += 1) {
        dummy.position.set((col - (COLS - 1) / 2) * PITCH, 0, (row - (ROWS - 1) / 2) * PITCH)
        dummy.updateMatrix()
        keys.current.setMatrixAt(i, dummy.matrix)
        keys.current.setColorAt(i, color.set('#00e5ff'))
        i += 1
      }
    }
    keys.current.instanceMatrix.needsUpdate = true
    keys.current.instanceColor.needsUpdate = true
  }, [color])

  useFrame(({ clock }) => {
    const t = reducedMotion ? 0 : clock.elapsedTime
    let i = 0
    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLS; col += 1) {
        const hue = hovered
          ? (t * 0.4 + col / COLS + row * 0.05) % 1
          : 0.5 + 0.22 * (0.5 + 0.5 * Math.sin(t * 2 - col * 0.45))
        keys.current.setColorAt(i, color.setHSL(hue, 1, 0.55))
        i += 1
      }
    }
    keys.current.instanceColor.needsUpdate = true
  })

  return (
    <group
      position={[0, DESK_TOP + 0.012, 0.16]}
      onPointerOver={(event) => {
        event.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh position={[0.1, -0.018, 0.02]} receiveShadow>
        <boxGeometry args={[0.9, 0.003, 0.34]} />
        <meshStandardMaterial color="#0e1119" roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.006, 0]} castShadow>
        <boxGeometry args={[COLS * PITCH + 0.02, 0.014, ROWS * PITCH + 0.02]} />
        <meshStandardMaterial color="#141824" roughness={0.5} />
      </mesh>
      <instancedMesh ref={keys} args={[undefined, undefined, COLS * ROWS]}>
        <boxGeometry args={[KEY, 0.01, KEY]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <RoundedBox args={[0.06, 0.022, 0.1]} radius={0.01} position={[0.34, -0.004, 0.02]} castShadow>
        <meshStandardMaterial color="#141824" roughness={0.4} />
      </RoundedBox>
    </group>
  )
}
```

- [ ] **Step 2: Taza con vapor** — `src/scene/props/Mug.jsx`:

```jsx
import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { DESK_TOP } from '../layout'

const CERAMIC = '#e8ecf4'

export default function Mug({ reducedMotion }) {
  const [hovered, setHovered] = useState(false)
  const puffs = useRef([])

  useFrame(({ clock }) => {
    const speed = hovered ? 2.2 : 1
    puffs.current.forEach((puff, index) => {
      if (!puff) return
      const t = reducedMotion ? 0.5 : (clock.elapsedTime * 0.35 * speed + index / 3) % 1
      puff.position.set(Math.sin(t * 6 + index) * 0.015, 0.11 + t * 0.22, 0)
      puff.scale.setScalar(0.6 + t * 0.9)
      puff.material.opacity = (1 - t) * (hovered ? 0.35 : 0.18)
    })
  })

  return (
    <group
      position={[-0.72, DESK_TOP, 0.12]}
      onPointerOver={(event) => {
        event.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.035, 0.1, 24]} />
        <meshStandardMaterial color={CERAMIC} roughness={0.35} />
      </mesh>
      <mesh position={[0.045, 0.05, 0]}>
        <torusGeometry args={[0.022, 0.007, 10, 20]} />
        <meshStandardMaterial color={CERAMIC} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.098, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.036, 24]} />
        <meshStandardMaterial color="#3b2416" roughness={0.2} />
      </mesh>
      {[0, 1, 2].map((index) => (
        <mesh
          key={index}
          ref={(mesh) => {
            puffs.current[index] = mesh
          }}
        >
          <sphereGeometry args={[0.02, 10, 10]} />
          <meshBasicMaterial color="#cfd8e6" transparent opacity={0.18} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}
```

- [ ] **Step 3: Lámpara con partículas de polvo** — `src/scene/props/Lamp.jsx`:

```jsx
import { useState } from 'react'
import { Sparkles, useCursor } from '@react-three/drei'
import { DoubleSide } from 'three'
import { useSceneStore } from '../../store/sceneStore'
import { DESK_TOP } from '../layout'

const METAL = '#1d2230'

export default function Lamp({ sparkles }) {
  const lampOn = useSceneStore((state) => state.lampOn)
  const toggleLamp = useSceneStore((state) => state.toggleLamp)
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  return (
    <group>
      <group
        position={[-0.98, DESK_TOP, -0.22]}
        onClick={(event) => {
          event.stopPropagation()
          toggleLamp()
        }}
        onPointerOver={(event) => {
          event.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={() => setHovered(false)}
      >
        <mesh position={[0, 0.01, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.1, 0.02, 32]} />
          <meshStandardMaterial color={METAL} metalness={0.7} roughness={0.35} />
        </mesh>
        <mesh position={[0.04, 0.23, 0]} rotation={[0, 0, -0.19]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.43, 12]} />
          <meshStandardMaterial color={METAL} metalness={0.7} roughness={0.35} />
        </mesh>
        <mesh position={[0.19, 0.48, 0]} rotation={[0, 0, -1.22]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.234, 12]} />
          <meshStandardMaterial color={METAL} metalness={0.7} roughness={0.35} />
        </mesh>
        <mesh position={[0.34, 0.49, 0]} rotation={[0, 0, Math.PI * 0.8]} castShadow>
          <coneGeometry args={[0.07, 0.1, 24, 1, true]} />
          <meshStandardMaterial color={METAL} metalness={0.7} roughness={0.35} side={DoubleSide} />
        </mesh>
        <mesh position={[0.34, 0.47, 0]}>
          <sphereGeometry args={[0.025, 16, 16]} />
          <meshBasicMaterial color={lampOn ? '#ffd9a0' : '#3a3024'} toneMapped={false} />
        </mesh>
      </group>
      <Sparkles
        count={sparkles}
        scale={[0.6, 0.5, 0.6]}
        position={[-0.5, 1.0, -0.05]}
        size={1.6}
        speed={0.25}
        opacity={lampOn ? 0.6 : 0.15}
        color="#ffd9a0"
      />
    </group>
  )
}
```

- [ ] **Step 4: Planta y olivo** — `src/scene/props/Plants.jsx`:

```jsx
import { DESK_TOP } from '../layout'

const LEAVES = [0, 1, 2, 3, 4]
const FOLIAGE = [
  [0, 0.95, 0, 0.22],
  [0.14, 0.85, 0.05, 0.17],
  [-0.13, 0.88, -0.04, 0.18],
  [0.02, 1.08, -0.06, 0.16],
]

export function DeskPlant() {
  return (
    <group position={[1.02, DESK_TOP, 0.26]}>
      <mesh position={[0, 0.045, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.04, 0.09, 20]} />
        <meshStandardMaterial color="#d8d2c4" roughness={0.8} />
      </mesh>
      {LEAVES.map((index) => (
        <mesh
          key={index}
          position={[Math.cos(index * 1.26) * 0.02, 0.13, Math.sin(index * 1.26) * 0.02]}
          rotation={[Math.sin(index * 1.26) * 0.5, 0, -Math.cos(index * 1.26) * 0.5]}
          castShadow
        >
          <coneGeometry args={[0.018, 0.1, 6]} />
          <meshStandardMaterial color="#3f8f5a" roughness={0.6} flatShading />
        </mesh>
      ))}
    </group>
  )
}

export function OliveTree() {
  return (
    <group position={[-1.55, 0, -0.5]}>
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.12, 0.3, 24]} />
        <meshStandardMaterial color="#8a4b2f" roughness={0.85} />
      </mesh>
      <mesh position={[0.02, 0.6, 0]} rotation={[0, 0, -0.08]} castShadow>
        <cylinderGeometry args={[0.025, 0.04, 0.62, 8]} />
        <meshStandardMaterial color="#5b4636" roughness={0.9} flatShading />
      </mesh>
      {FOLIAGE.map(([x, y, z, r]) => (
        <mesh key={`${x}:${y}`} position={[x, y, z]} castShadow>
          <icosahedronGeometry args={[r, 0]} />
          <meshStandardMaterial color="#6b7d3a" roughness={0.8} flatShading />
        </mesh>
      ))}
    </group>
  )
}
```

- [ ] **Step 5: Auriculares y torre** — `src/scene/props/Headphones.jsx`:

```jsx
import { DESK_TOP } from '../layout'

const DARK = '#141824'

export default function Headphones() {
  return (
    <group position={[-0.42, DESK_TOP, -0.3]}>
      <mesh position={[0, 0.006, 0]}>
        <cylinderGeometry args={[0.05, 0.055, 0.012, 24]} />
        <meshStandardMaterial color={DARK} metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.26, 10]} />
        <meshStandardMaterial color={DARK} metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.27, 0]}>
        <torusGeometry args={[0.075, 0.01, 10, 32, Math.PI]} />
        <meshStandardMaterial color={DARK} roughness={0.5} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.075, 0.25, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.035, 0.035, 0.025, 20]} />
            <meshStandardMaterial color={DARK} roughness={0.5} />
          </mesh>
          <mesh position={[side * 0.013, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.03, 0.003, 8, 24]} />
            <meshBasicMaterial color="#00e5ff" toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
```

`src/scene/props/Tower.jsx`:

```jsx
const ORBITS = [0, Math.PI / 3, -Math.PI / 3]

export default function Tower() {
  return (
    <group position={[1.45, 0, -0.15]}>
      <mesh position={[0, 0.24, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.22, 0.48, 0.46]} />
        <meshStandardMaterial color="#10131c" metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.24, 0.231]}>
        <boxGeometry args={[0.012, 0.4, 0.002]} />
        <meshBasicMaterial color="#7c5cff" toneMapped={false} />
      </mesh>
      <group position={[0, 0.34, 0.232]}>
        {ORBITS.map((angle) => (
          <mesh key={angle} rotation={[0, 0, angle]} scale={[1, 0.38, 1]}>
            <torusGeometry args={[0.05, 0.004, 8, 48]} />
            <meshBasicMaterial color="#61dafb" toneMapped={false} />
          </mesh>
        ))}
        <mesh>
          <sphereGeometry args={[0.009, 12, 12]} />
          <meshBasicMaterial color="#61dafb" toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}
```

- [ ] **Step 6: Componer** — `src/scene/props/Props.jsx`:

```jsx
import Mug from './Mug'
import Lamp from './Lamp'
import Headphones from './Headphones'
import Tower from './Tower'
import { DeskPlant, OliveTree } from './Plants'

export default function Props({ reducedMotion, sparkles }) {
  return (
    <>
      <Mug reducedMotion={reducedMotion} />
      <Lamp sparkles={sparkles} />
      <Headphones />
      <Tower />
      <DeskPlant />
      <OliveTree />
    </>
  )
}
```

En `SceneCanvas.jsx` importar `Keyboard` y `Props` y renderizar tras `<Monitors />`:

```jsx
<Keyboard reducedMotion={reducedMotion} />
<Props reducedMotion={reducedMotion} sparkles={settings.sparkles} />
```

- [ ] **Step 7: Verificar**

Run: `npm run lint && npm test` → Expected: PASS.

En el navegador integrado (captura a 1440×900): se ven teclado con ola cian→violeta, taza con vapor, lámpara con luz cálida y polvo en el haz, auriculares con aros cian, torre con átomo de React, planta y olivo. Pasar el ratón por el teclado → arcoíris; por la taza → más vapor; clic en la lámpara → se apaga y el polvo casi desaparece. Ajustar posiciones si algún objeto se solapa (las coordenadas de este plan son de partida; los cambios deben quedarse en los componentes, sin tocar `layout.js` salvo que afecte a varios objetos).

- [ ] **Step 8: Commit**

```bash
git add src/scene
git commit -m "Add RGB keyboard and desk props: mug, lamp, headphones, tower, plants"
```

---

### Task 9: Preloader

**Files:**
- Create: `src/hooks/usePreload.js`, `src/lib/loadImage.js`, `src/components/Preloader.jsx`, `src/components/css/Preloader.css`
- Test: `src/hooks/usePreload.test.js`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `loadScene` (Task 6), `useSceneStore.tier`, `useT`
- Produces:
  - `computeProgress({ elapsed, minDuration, done, total }) → 0..100`
  - `usePreload(tasks: Array<() => Promise|unknown>, { minDuration = 1400, timeout = 6000 }) → { progress, finished }`
  - `loadImage(src) → Promise<void>`
  - `<Preloader tasks reducedMotion onDone />`
  - En `App`: estado `ready` (true tras el preloader), que reciben `Hero` y `useSmoothScroll`

- [ ] **Step 1: Tests (fallan)** — `src/hooks/usePreload.test.js`:

```js
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { computeProgress, usePreload } from './usePreload'

describe('computeProgress', () => {
  it('never runs ahead of the real work', () => {
    expect(computeProgress({ elapsed: 5000, minDuration: 1000, done: 1, total: 2 })).toBe(50)
  })

  it('never runs ahead of the minimum duration', () => {
    expect(computeProgress({ elapsed: 250, minDuration: 1000, done: 2, total: 2 })).toBe(25)
  })

  it('handles no tasks and no minimum duration', () => {
    expect(computeProgress({ elapsed: 0, minDuration: 0, done: 0, total: 0 })).toBe(100)
  })
})

describe('usePreload', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame', 'performance'] })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('finishes once every task resolves and the minimum time passes', async () => {
    const { result } = renderHook(() => usePreload([() => Promise.resolve()], { minDuration: 500 }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(600)
    })
    expect(result.current).toEqual({ progress: 100, finished: true })
  })

  it('counts failed tasks as done', async () => {
    const { result } = renderHook(() => usePreload([() => Promise.reject(new Error('404'))], { minDuration: 100 }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200)
    })
    expect(result.current.finished).toBe(true)
  })

  it('gives up waiting after the timeout', async () => {
    const never = () => new Promise(() => {})
    const { result } = renderHook(() => usePreload([never], { minDuration: 100, timeout: 1000 }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(900)
    })
    expect(result.current.finished).toBe(false)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200)
    })
    expect(result.current).toEqual({ progress: 100, finished: true })
  })
})
```

- [ ] **Step 2: Ejecutar** — Run: `npx vitest run src/hooks/usePreload.test.js` → Expected: FAIL.

- [ ] **Step 3: Implementar**

`src/hooks/usePreload.js`:

```js
import { useEffect, useState } from 'react'

export function computeProgress({ elapsed, minDuration, done, total }) {
  const time = minDuration <= 0 ? 1 : Math.min(1, elapsed / minDuration)
  const real = total === 0 ? 1 : done / total
  return Math.round(100 * Math.min(time, real))
}

export function usePreload(tasks, { minDuration = 1400, timeout = 6000 } = {}) {
  const [initialTasks] = useState(tasks)
  const [state, setState] = useState({ progress: 0, finished: false })

  useEffect(() => {
    let done = 0
    let cancelled = false
    let frame = 0
    const start = performance.now()

    initialTasks.forEach((task) => {
      Promise.resolve()
        .then(task)
        .catch(() => {})
        .finally(() => {
          done += 1
        })
    })

    const tick = () => {
      if (cancelled) return
      const elapsed = performance.now() - start
      const progress =
        elapsed >= timeout ? 100 : computeProgress({ elapsed, minDuration, done, total: initialTasks.length })
      setState({ progress, finished: progress >= 100 })
      if (progress < 100) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
    }
  }, [initialTasks, minDuration, timeout])

  return state
}
```

`src/lib/loadImage.js`:

```js
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve()
    image.onerror = reject
    image.src = src
  })
}
```

- [ ] **Step 4: Ejecutar** — Run: `npx vitest run src/hooks/usePreload.test.js` → Expected: PASS (6 tests). Si `toFake: ['performance']` no avanza `performance.now()` en esta versión de Vitest, sustituir en el hook `performance.now()` por `Date.now()` y añadir `'Date'` a `toFake`.

- [ ] **Step 5: Componente** — `src/components/Preloader.jsx`:

```jsx
import { useEffect, useState } from 'react'
import { usePreload } from '../hooks/usePreload'
import { useT } from '../i18n/useLang'
import './css/Preloader.css'

export default function Preloader({ tasks, reducedMotion, onDone }) {
  const t = useT()
  const { progress, finished } = usePreload(tasks, { minDuration: reducedMotion ? 0 : 1400 })
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    document.documentElement.classList.add('is-loading')
    return () => document.documentElement.classList.remove('is-loading')
  }, [])

  useEffect(() => {
    if (!finished) return undefined
    document.documentElement.classList.remove('is-loading')
    onDone()
    const id = setTimeout(() => setHidden(true), reducedMotion ? 0 : 900)
    return () => clearTimeout(id)
  }, [finished, reducedMotion, onDone])

  if (hidden) return null

  return (
    <div className={`preloader${finished ? ' is-done' : ''}`} role="status" aria-busy={!finished}>
      <span className="sr-only">{t('loading')}</span>
      <p className="preloader-brand" aria-hidden="true">
        &lt;MDG /&gt;
      </p>
      <p className="preloader-count" aria-hidden="true">
        {String(progress).padStart(3, '0')}
      </p>
      <div className="preloader-bar" aria-hidden="true">
        <span style={{ transform: `scaleX(${progress / 100})` }} />
      </div>
    </div>
  )
}
```

`src/components/css/Preloader.css`:

```css
.preloader {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 1.25rem;
  background: var(--bg);
  transition: transform 0.9s var(--ease-out);
}

.preloader.is-done {
  transform: translateY(-100%);
}

.preloader-brand {
  color: var(--accent);
  font-family: var(--font-mono);
  text-shadow: 0 0 14px rgba(0, 229, 255, 0.5);
}

.preloader-count {
  font-family: var(--font-display);
  font-size: clamp(4rem, 14vw, 9rem);
  font-weight: 600;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.preloader-bar {
  width: min(280px, 60vw);
  height: 2px;
  background: var(--border);
  overflow: hidden;
}

.preloader-bar span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  transform-origin: left;
  transition: transform 0.15s linear;
}
```

- [ ] **Step 6: Conectar en `App.jsx`** — estado final tras esta tarea:

```jsx
import { useCallback, useState } from 'react'
import Navbar from './components/Navbar'
import Preloader from './components/Preloader'
import SceneLayer from './scene/SceneLayer'
import { loadScene } from './scene/loadScene'
import { useQualityTier } from './scene/useQualityTier'
import { useReducedMotion } from './hooks/useReducedMotion'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import { useActiveSection } from './hooks/useActiveSection'
import { SECTION_IDS } from './data/sections'
import { loadImage } from './lib/loadImage'
import { useSceneStore } from './store/sceneStore'

const PRELOAD_TASKS = [
  () => document.fonts?.ready,
  () => loadImage(window.innerWidth < 768 ? '/img/portrait-540.webp' : '/img/portrait-1086.webp'),
  () => (useSceneStore.getState().tier === 'static' ? null : loadScene()),
]

export default function App() {
  const reducedMotion = useReducedMotion()
  const [ready, setReady] = useState(false)
  const handleLoaded = useCallback(() => setReady(true), [])

  useQualityTier()
  useSmoothScroll(ready && !reducedMotion)
  useActiveSection(SECTION_IDS)

  return (
    <>
      <SceneLayer reducedMotion={reducedMotion} />
      <Navbar />
      <main id="main"></main>
      <Preloader tasks={PRELOAD_TASKS} reducedMotion={reducedMotion} onDone={handleLoaded} />
    </>
  )
}
```

- [ ] **Step 7: Verificar y commit**

Run: `npm test && npm run lint` → Expected: PASS. En el navegador: el contador sube de 000 a 100, la pantalla se desliza hacia arriba y aparece la escena. Con la red limitada a "Slow 3G" en DevTools el preloader termina como máximo a los 6 s.

```bash
git add src/hooks/usePreload.js src/hooks/usePreload.test.js src/lib/loadImage.js src/components/Preloader.jsx src/components/css/Preloader.css src/App.jsx
git commit -m "Add preloader that waits for fonts, portrait and 3D chunk with a timeout"
```

---

### Task 10: Hero con foto recortada y rol tipo máquina de escribir

**Files:**
- Create: `src/hooks/useTypewriter.js`, `src/components/Hero.jsx`, `src/components/HeroPortrait.jsx`, `src/components/css/Hero.css`
- Test: `src/hooks/useTypewriter.test.js`, `src/components/Hero.test.jsx`
- Modify: `src/App.jsx`, `index.html`

**Interfaces:**
- Consumes: `profile`, `localize`, `useLang`, `useT`, `gsap`/`useGSAP`
- Produces:
  - `nextTypewriterState(state, words, { typeMs, deleteMs, holdMs }) → state` con `state = { index, text, deleting, delay }`
  - `useTypewriter(words, { enabled, typeMs = 75, deleteMs = 40, holdMs = 1600 }) → string`
  - `<Hero ready reducedMotion />`, `<HeroPortrait reducedMotion />` (en la fase 3 este componente pasará a reproducir la secuencia de brazos)

- [ ] **Step 1: Tests (fallan)**

`src/hooks/useTypewriter.test.js`:

```js
import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTypewriterState, useTypewriter } from './useTypewriter'

const timing = { typeMs: 10, deleteMs: 5, holdMs: 100 }

describe('nextTypewriterState', () => {
  it('types, holds, deletes and moves to the next word', () => {
    const words = ['ab', 'c']
    let state = { index: 0, text: '', deleting: false, delay: 10 }
    const seen = []
    for (let i = 0; i < 7; i += 1) {
      state = nextTypewriterState(state, words, timing)
      seen.push(`${state.text}|${state.deleting}|${state.delay}`)
    }
    expect(seen).toEqual(['a|false|10', 'ab|false|10', 'ab|true|100', 'a|true|5', '|true|5', '|false|10', 'c|false|10'])
  })
})

describe('useTypewriter', () => {
  afterEach(() => vi.useRealTimers())

  it('shows the first word, fully typed, when disabled', () => {
    const { result } = renderHook(() => useTypewriter(['Web Developer', 'Full Stack'], { enabled: false }))
    expect(result.current).toBe('Web Developer')
  })

  it('types the first word over time when enabled', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useTypewriter(['Web'], { enabled: true, typeMs: 50 }))
    expect(result.current).toBe('')
    for (let i = 0; i < 3; i += 1) act(() => vi.advanceTimersByTime(50))
    expect(result.current).toBe('Web')
  })
})
```

`src/components/Hero.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Hero from './Hero'

describe('Hero', () => {
  it('presents name, role, portrait and calls to action', () => {
    render(<Hero ready reducedMotion />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Miguel Ángel')
    expect(screen.getByText('Web Developer', { selector: '.hero-role-text' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Miguel Ángel con los brazos cruzados' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver proyectos' })).toHaveAttribute('href', '#projects')
    expect(screen.getByRole('link', { name: 'Contactar' })).toHaveAttribute('href', '#contact')
    expect(screen.getByText('Disponible para nuevos proyectos')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Ejecutar** — Run: `npx vitest run src/hooks/useTypewriter.test.js src/components/Hero.test.jsx` → Expected: FAIL.

- [ ] **Step 3: Implementar el hook** — `src/hooks/useTypewriter.js`:

```js
import { useEffect, useState } from 'react'

export function nextTypewriterState(state, words, { typeMs, deleteMs, holdMs }) {
  const word = words[state.index]
  if (!state.deleting) {
    if (state.text.length < word.length) return { ...state, text: word.slice(0, state.text.length + 1), delay: typeMs }
    return { ...state, deleting: true, delay: holdMs }
  }
  if (state.text.length > 0) return { ...state, text: word.slice(0, state.text.length - 1), delay: deleteMs }
  return { index: (state.index + 1) % words.length, text: '', deleting: false, delay: typeMs }
}

export function useTypewriter(words, { enabled = true, typeMs = 75, deleteMs = 40, holdMs = 1600 } = {}) {
  const key = words.join('|')
  const [state, setState] = useState({ index: 0, text: '', deleting: false, delay: typeMs, key })

  if (state.key !== key) setState({ index: 0, text: '', deleting: false, delay: typeMs, key })

  useEffect(() => {
    if (!enabled) return undefined
    const id = setTimeout(
      () => setState((current) => ({ ...nextTypewriterState(current, key.split('|'), { typeMs, deleteMs, holdMs }), key })),
      state.delay,
    )
    return () => clearTimeout(id)
  }, [state, enabled, key, typeMs, deleteMs, holdMs])

  return enabled ? state.text : words[0]
}
```

- [ ] **Step 4: Componentes**

`src/components/HeroPortrait.jsx`:

```jsx
import { useEffect, useRef } from 'react'
import { useT } from '../i18n/useLang'

export default function HeroPortrait({ reducedMotion }) {
  const t = useT()
  const ref = useRef(null)

  useEffect(() => {
    if (reducedMotion || window.matchMedia('(pointer: coarse)').matches) return undefined
    let frame = 0
    const onMove = (event) => {
      const x = event.clientX / window.innerWidth - 0.5
      const y = event.clientY / window.innerHeight - 0.5
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        ref.current?.style.setProperty('--px', x.toFixed(3))
        ref.current?.style.setProperty('--py', y.toFixed(3))
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(frame)
    }
  }, [reducedMotion])

  return (
    <div className="hero-portrait" ref={ref}>
      <img
        src="/img/portrait-1086.webp"
        srcSet="/img/portrait-540.webp 540w, /img/portrait-1086.webp 1086w"
        sizes="(max-width: 768px) 78vw, 520px"
        width="1086"
        height="1448"
        alt={t('portraitAlt')}
        fetchPriority="high"
      />
    </div>
  )
}
```

`src/components/Hero.jsx`:

```jsx
import { useRef } from 'react'
import { FiArrowDown } from 'react-icons/fi'
import { gsap, useGSAP } from '../lib/gsap'
import { profile } from '../data/profile'
import { localize } from '../data/localize'
import { useLang, useT } from '../i18n/useLang'
import { useTypewriter } from '../hooks/useTypewriter'
import HeroPortrait from './HeroPortrait'
import './css/Hero.css'

export default function Hero({ ready, reducedMotion }) {
  const lang = useLang()
  const t = useT()
  const ref = useRef(null)
  const roles = localize(profile.roles, lang)
  const role = useTypewriter(roles, { enabled: ready && !reducedMotion })

  useGSAP(
    () => {
      if (!ready || reducedMotion) return
      gsap
        .timeline({ defaults: { ease: 'power4.out' } })
        .from('.hero-name-line', { yPercent: 110, duration: 1.1, stagger: 0.12 })
        .from('.hero-portrait', { y: 60, opacity: 0, duration: 1.2 }, 0.15)
        .from('.hero-meta > *', { y: 20, opacity: 0, duration: 0.8, stagger: 0.08 }, 0.45)
    },
    { scope: ref, dependencies: [ready, reducedMotion] },
  )

  return (
    <section id="hero" className="hero" ref={ref} aria-labelledby="hero-title">
      <h1 id="hero-title" className="hero-name">
        <span className="hero-name-mask">
          <span className="hero-name-line">Miguel</span>
        </span>{' '}
        <span className="hero-name-mask">
          <span className="hero-name-line hero-name-outline">Ángel</span>
        </span>
      </h1>

      <HeroPortrait reducedMotion={reducedMotion} />

      <div className="hero-meta">
        <p className="hero-available">
          <span className="dot" aria-hidden="true" />
          {localize(profile.available, lang)}
        </p>
        <p className="hero-role">
          <span className="sr-only">{roles.join(', ')}</span>
          <span className="hero-role-text" aria-hidden="true">
            {role}
          </span>
          <span className="hero-caret" aria-hidden="true" />
        </p>
        <p className="hero-sub">
          {profile.name} · {localize(profile.location, lang)}
        </p>
        <div className="hero-ctas">
          <a className="btn btn-primary" href="#projects">
            {t('heroCtaProjects')}
          </a>
          <a className="btn" href="#contact">
            {t('heroCtaContact')}
          </a>
        </div>
      </div>

      <a href="#about" className="hero-scroll" aria-label={t('scrollHint')}>
        <FiArrowDown aria-hidden="true" />
      </a>
    </section>
  )
}
```

`src/components/css/Hero.css`:

```css
.hero {
  position: relative;
  min-height: 100svh;
  overflow: hidden;
}

.hero-name {
  position: absolute;
  inset: calc(var(--nav-h) + 4vh) 0 auto;
  z-index: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: clamp(4.5rem, 17vw, 15rem);
  font-weight: 700;
  line-height: 0.86;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  pointer-events: none;
}

.hero-name-mask {
  display: block;
  overflow: hidden;
}

.hero-name-line {
  display: inline-block;
  background: linear-gradient(180deg, var(--text) 30%, rgba(232, 236, 244, 0.35));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero-name-outline {
  background: none;
  -webkit-text-stroke: 1.5px rgba(0, 229, 255, 0.55);
}

.hero-portrait {
  position: absolute;
  bottom: 0;
  left: 50%;
  z-index: 1;
  width: min(520px, 78vw);
  transform: translateX(-50%);
}

.hero-portrait img {
  transform: translate3d(calc(var(--px, 0) * -14px), calc(var(--py, 0) * -8px), 0);
  transition: transform 0.4s var(--ease-out);
  filter: drop-shadow(0 0 1px rgba(0, 229, 255, 0.9)) drop-shadow(0 0 22px rgba(0, 229, 255, 0.28))
    drop-shadow(-18px 0 40px rgba(124, 92, 255, 0.25));
  -webkit-mask-image: linear-gradient(to bottom, #000 80%, transparent);
  mask-image: linear-gradient(to bottom, #000 80%, transparent);
}

.hero-meta {
  position: absolute;
  left: max(16px, calc((100vw - var(--container)) / 2));
  bottom: 10vh;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.85rem;
  max-width: 380px;
}

.hero-available {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.35rem 0.85rem;
  border: 1px solid rgba(61, 220, 151, 0.35);
  border-radius: 999px;
  background: rgba(7, 8, 13, 0.6);
  color: var(--success);
  font-size: 0.85rem;
}

.hero-role {
  min-height: 1.2em;
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 3.4vw, 2.6rem);
  font-weight: 600;
  line-height: 1.2;
}

.hero-role-text {
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero-caret {
  display: inline-block;
  width: 3px;
  height: 0.9em;
  margin-left: 4px;
  vertical-align: -0.08em;
  background: var(--accent);
  animation: caret-blink 1s steps(1) infinite;
}

@keyframes caret-blink {
  50% {
    opacity: 0;
  }
}

.hero-sub {
  color: var(--text-muted);
}

.hero-ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.hero-scroll {
  position: absolute;
  right: max(16px, calc((100vw - var(--container)) / 2));
  bottom: 10vh;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border: 1px solid var(--border-strong);
  border-radius: 50%;
  color: var(--text-muted);
  animation: scroll-bob 2.4s ease-in-out infinite;
}

@keyframes scroll-bob {
  50% {
    transform: translateY(6px);
  }
}

@media (max-width: 767px) {
  .hero-portrait {
    width: 72vw;
    bottom: 30vh;
  }

  .hero-meta {
    left: 16px;
    right: 16px;
    bottom: 4vh;
    max-width: none;
    padding-top: 2rem;
    background: linear-gradient(to bottom, transparent, var(--bg) 30%);
  }

  .hero-scroll {
    display: none;
  }
}
```

- [ ] **Step 5: Precargar la foto** — en `index.html`, antes de `</head>`:

```html
<link
  rel="preload"
  as="image"
  href="/img/portrait-1086.webp"
  imagesrcset="/img/portrait-540.webp 540w, /img/portrait-1086.webp 1086w"
  imagesizes="(max-width: 768px) 78vw, 520px"
  fetchpriority="high"
/>
```

- [ ] **Step 6: Montar en `App.jsx`** — importar `Hero` y renderizar dentro de `<main id="main">`:

```jsx
<Hero ready={ready} reducedMotion={reducedMotion} />
```

- [ ] **Step 7: Verificar y commit**

Run: `npm test && npm run lint` → Expected: PASS. En el navegador: tras el preloader el nombre sube desde su máscara, la foto aparece con contorno cian y se mueve un poco con el ratón, y el rol se escribe y se borra. A 375 px la foto queda arriba y el texto abajo sin solaparse. Ajustar `CAMERA_POSES.hero` si el escritorio no se ve bien detrás de la foto.

```bash
git add src/hooks/useTypewriter.js src/hooks/useTypewriter.test.js src/components/Hero.jsx src/components/HeroPortrait.jsx src/components/Hero.test.jsx src/components/css/Hero.css src/App.jsx index.html
git commit -m "Add hero with transparent portrait, giant name and typewriter role"
```

---

### Task 11: Sobre mí (bento), contadores y marquesina de tecnologías

**Files:**
- Create: `src/lib/format.js`, `src/components/CountUp.jsx`, `src/components/About.jsx`, `src/components/TechMarquee.jsx`, `src/components/css/About.css`
- Test: `src/lib/format.test.js`, `src/components/CountUp.test.jsx`, `src/components/About.test.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `profile`, `experience`, `TECH`, `skillCategories`, `Reveal`, `SectionHeading`
- Produces: `formatNumber(value, decimals, lang) → string`; `<CountUp value decimals? suffix? reducedMotion duration? />`; `<About reducedMotion />`; `<TechMarquee />`

- [ ] **Step 1: Tests (fallan)**

`src/lib/format.test.js`:

```js
import { describe, expect, it } from 'vitest'
import { formatNumber } from './format'

describe('formatNumber', () => {
  it('uses a decimal comma in Spanish and a point in English', () => {
    expect(formatNumber(9.7, 1, 'es')).toBe('9,7')
    expect(formatNumber(9.7, 1, 'en')).toBe('9.7')
  })

  it('rounds to the requested decimals', () => {
    expect(formatNumber(3.456, 0, 'es')).toBe('3')
  })
})
```

`src/components/CountUp.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MockIntersectionObserver } from '../test/mocks'
import CountUp from './CountUp'

describe('CountUp', () => {
  it('shows the final value straight away when motion is reduced', () => {
    render(<CountUp value={9.7} decimals={1} reducedMotion />)
    expect(screen.getByText('9,7', { selector: '[aria-hidden="true"]' })).toBeInTheDocument()
  })

  it('starts at zero and waits until it is visible', () => {
    render(<CountUp value={4} reducedMotion={false} />)
    expect(screen.getByText('0', { selector: '[aria-hidden="true"]' })).toBeInTheDocument()
    expect(MockIntersectionObserver.instances).toHaveLength(1)
  })

  it('always exposes the final value to screen readers', () => {
    render(<CountUp value={3} suffix="+" reducedMotion={false} />)
    expect(screen.getByText('3+', { selector: '.sr-only' })).toBeInTheDocument()
  })
})
```

`src/components/About.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import About from './About'

describe('About', () => {
  it('shows bio, current role, location, stats and stack', () => {
    render(<About reducedMotion />)
    expect(screen.getByRole('heading', { level: 2, name: 'Sobre mí' })).toBeInTheDocument()
    expect(screen.getByText(/Soy de Jaén/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Web Developer' })).toBeInTheDocument()
    expect(screen.getByText('@ Macrosad')).toBeInTheDocument()
    expect(screen.getByText('Nota media en DAM')).toBeInTheDocument()
    expect(screen.getAllByText('Spring Boot').length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Ejecutar** — Run: `npx vitest run src/lib src/components/CountUp.test.jsx src/components/About.test.jsx` → Expected: FAIL.

- [ ] **Step 3: Implementar**

`src/lib/format.js`:

```js
const LOCALES = { es: 'es-ES', en: 'en-GB' }

export function formatNumber(value, decimals = 0, lang = 'es') {
  return new Intl.NumberFormat(LOCALES[lang] ?? LOCALES.es, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}
```

`src/components/CountUp.jsx`:

```jsx
import { useEffect, useRef, useState } from 'react'
import { formatNumber } from '../lib/format'
import { useLang } from '../i18n/useLang'

export default function CountUp({ value, decimals = 0, suffix = '', reducedMotion, duration = 1600 }) {
  const lang = useLang()
  const ref = useRef(null)
  const [display, setDisplay] = useState(reducedMotion ? value : 0)

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(value)
      return undefined
    }
    let frame = 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        const start = performance.now()
        const step = (now) => {
          const progress = Math.min(1, (now - start) / duration)
          setDisplay(value * (1 - Math.pow(1 - progress, 3)))
          if (progress < 1) frame = requestAnimationFrame(step)
        }
        frame = requestAnimationFrame(step)
      },
      { threshold: 0.6 },
    )
    observer.observe(ref.current)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [value, duration, reducedMotion])

  return (
    <span ref={ref}>
      <span aria-hidden="true">
        {formatNumber(display, decimals, lang)}
        {suffix}
      </span>
      <span className="sr-only">
        {formatNumber(value, decimals, lang)}
        {suffix}
      </span>
    </span>
  )
}
```

`src/components/TechMarquee.jsx`:

```jsx
import { TECH } from '../data/skills'

const ITEMS = Object.entries(TECH)

export default function TechMarquee() {
  return (
    <div className="marquee" aria-hidden="true">
      <ul className="marquee-track">
        {[...ITEMS, ...ITEMS].map(([id, tech], index) => (
          <li key={`${id}-${index}`} className="marquee-item" data-duplicate={index >= ITEMS.length || undefined}>
            <tech.Icon style={{ color: tech.color }} />
            <span>{tech.name}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

`src/components/About.jsx`:

```jsx
import { profile } from '../data/profile'
import { experience } from '../data/experience'
import { TECH, skillCategories } from '../data/skills'
import { localize } from '../data/localize'
import { useLang, useT } from '../i18n/useLang'
import Reveal from './Reveal'
import SectionHeading from './SectionHeading'
import CountUp from './CountUp'
import TechMarquee from './TechMarquee'
import './css/About.css'

const currentJob = experience.find((job) => job.end === null)

export default function About({ reducedMotion }) {
  const lang = useLang()
  const t = useT()

  return (
    <section id="about" className="section about" aria-labelledby="about-title">
      <div className="container">
        <SectionHeading id="about-title" eyebrow="01" title={t('aboutTitle')} />
        <Reveal className="bento">
          <article className="card bento-bio">
            <p className="bento-kicker">{t('aboutHello')}</p>
            <p className="bento-bio-text">{localize(profile.bio, lang)}</p>
          </article>

          <article className="card bento-now">
            <p className="bento-kicker">
              <span className="dot" aria-hidden="true" /> {t('aboutNow')}
            </p>
            <h3>{localize(currentJob.role, lang)}</h3>
            <p className="bento-muted">@ {currentJob.company}</p>
          </article>

          <article className="card bento-location">
            <p className="bento-kicker">{t('aboutBasedIn')}</p>
            <h3>{localize(profile.location, lang)}</h3>
            <p className="bento-muted mono">37.78° N · 3.78° W</p>
            <div className="radar" aria-hidden="true">
              <span />
            </div>
          </article>

          {profile.stats.map((stat) => (
            <article key={stat.id} className="card bento-stat">
              <p className="bento-stat-value">
                <CountUp value={stat.value} decimals={stat.decimals} suffix={stat.suffix} reducedMotion={reducedMotion} />
              </p>
              <p className="bento-muted">{localize(stat.label, lang)}</p>
            </article>
          ))}

          <article className="card bento-stack">
            <p className="bento-kicker">{t('aboutStack')}</p>
            <div className="stack-groups">
              {skillCategories.map((category) => (
                <div key={category.id} className="stack-group">
                  <h4>{localize(category.label, lang)}</h4>
                  <ul className="stack-list">
                    {category.items.map((id) => {
                      const tech = TECH[id]
                      return (
                        <li key={id} className="chip">
                          <tech.Icon aria-hidden="true" style={{ color: tech.color }} />
                          {tech.name}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </article>
        </Reveal>
      </div>
      <TechMarquee />
    </section>
  )
}
```

`src/components/css/About.css`:

```css
.bento {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 1rem;
}

.bento > .card {
  padding: 1.5rem;
}

.bento-bio {
  grid-column: span 4;
  grid-row: span 2;
}

.bento-now,
.bento-location {
  grid-column: span 2;
}

.bento-stat {
  grid-column: span 2;
}

.bento-stack {
  grid-column: span 6;
}

.bento-kicker {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 0.85rem;
}

.bento-bio-text {
  font-size: clamp(1.05rem, 1.6vw, 1.25rem);
  line-height: 1.7;
}

.bento h3 {
  font-size: 1.5rem;
}

.bento-muted {
  margin-top: 0.35rem;
  color: var(--text-muted);
}

.bento-location {
  position: relative;
  overflow: hidden;
}

.radar {
  position: absolute;
  right: 1.25rem;
  bottom: 1.25rem;
  width: 64px;
  height: 64px;
  border: 1px solid rgba(0, 229, 255, 0.25);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 229, 255, 0.12), transparent 70%);
}

.radar span {
  position: absolute;
  inset: 50%;
  width: 10px;
  height: 10px;
  margin: -5px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 0 rgba(0, 229, 255, 0.6);
  animation: radar-ping 2.2s infinite;
}

@keyframes radar-ping {
  70% {
    box-shadow: 0 0 0 26px rgba(0, 229, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 229, 255, 0);
  }
}

.bento-stat-value {
  font-family: var(--font-display);
  font-size: clamp(2.4rem, 4vw, 3.2rem);
  font-weight: 600;
  line-height: 1;
  color: var(--text);
  font-variant-numeric: tabular-nums;
}

.stack-groups {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
}

.stack-group h4 {
  margin-bottom: 0.6rem;
  color: var(--text-muted);
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 500;
}

.stack-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.marquee {
  margin-top: 3rem;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
}

.marquee-track {
  display: flex;
  gap: 2.5rem;
  width: max-content;
  animation: marquee 40s linear infinite;
}

.marquee:hover .marquee-track {
  animation-play-state: paused;
}

.marquee-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
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
    width: auto;
    animation: none;
  }

  .marquee-item[data-duplicate] {
    display: none;
  }
}

@media (max-width: 900px) {
  .bento {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .bento-bio,
  .bento-stack {
    grid-column: span 2;
    grid-row: auto;
  }

  .bento-now,
  .bento-location,
  .bento-stat {
    grid-column: span 1;
  }
}

@media (max-width: 480px) {
  .bento-now,
  .bento-location {
    grid-column: span 2;
  }
}
```

- [ ] **Step 4: Ejecutar** — Run: `npx vitest run src/lib src/components/CountUp.test.jsx src/components/About.test.jsx` → Expected: PASS (6 tests).

- [ ] **Step 5: Montar** — en `App.jsx` importar `About` y añadir `<About reducedMotion={reducedMotion} />` tras `<Hero />`.

- [ ] **Step 6: Verificar y commit**

Run: `npm test && npm run lint` → Expected: PASS. En el navegador: al bajar, la cámara orbita (pose `about`), las tarjetas aparecen escalonadas, los contadores suben a 9,7 / 4 / 3+ y la marquesina se desplaza y se para al pasar el ratón.

```bash
git add src/lib/format.js src/lib/format.test.js src/components/CountUp.jsx src/components/CountUp.test.jsx src/components/About.jsx src/components/About.test.jsx src/components/TechMarquee.jsx src/components/css/About.css src/App.jsx
git commit -m "Add bento About section with animated stats and tech marquee"
```

---

### Task 12: Experiencia como línea de tiempo

**Files:**
- Create: `src/components/Experience.jsx`, `src/components/css/Experience.css`
- Test: `src/components/Experience.test.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `experience`, `localize`, `useLang`, `useT`, `SectionHeading`, `gsap`/`useGSAP`
- Produces: `<Experience reducedMotion />`

- [ ] **Step 1: Test (falla)** — `src/components/Experience.test.jsx`:

```jsx
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Experience from './Experience'

describe('Experience', () => {
  it('lists jobs from newest to oldest and highlights the current one', () => {
    render(<Experience reducedMotion />)
    const items = screen.getAllByRole('listitem').filter((li) => li.classList.contains('timeline-item'))
    expect(items.map((li) => within(li).getByRole('heading', { level: 3 }).textContent)).toEqual([
      'Web Developer',
      'Técnico Auxiliar IT',
      'Desarrollador Full Stack y Odoo',
      'Técnico Informático',
    ])
    expect(items[0]).toHaveClass('is-current')
    expect(within(items[0]).getByText('Actual')).toBeInTheDocument()
    expect(within(items[1]).queryByText('Actual')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Ejecutar** — Run: `npx vitest run src/components/Experience.test.jsx` → Expected: FAIL.

- [ ] **Step 3: Implementar**

`src/components/Experience.jsx`:

```jsx
import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { experience } from '../data/experience'
import { localize } from '../data/localize'
import { useLang, useT } from '../i18n/useLang'
import SectionHeading from './SectionHeading'
import './css/Experience.css'

export default function Experience({ reducedMotion }) {
  const lang = useLang()
  const t = useT()
  const ref = useRef(null)

  useGSAP(
    () => {
      if (reducedMotion) return
      gsap.fromTo(
        '.timeline-progress',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: '.timeline', start: 'top 70%', end: 'bottom 60%', scrub: true },
        },
      )
      gsap.utils.toArray('.timeline-item').forEach((item) => {
        gsap.from(item, {
          x: 40,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: item, start: 'top 85%', once: true },
        })
      })
    },
    { scope: ref, dependencies: [reducedMotion] },
  )

  return (
    <section id="experience" className="section" aria-labelledby="experience-title" ref={ref}>
      <div className="container">
        <SectionHeading id="experience-title" eyebrow="02" title={t('experienceTitle')} />
        <div className="timeline">
          <span className="timeline-rail" aria-hidden="true">
            <span className="timeline-progress" />
          </span>
          <ol className="timeline-list">
            {experience.map((job) => (
              <li key={job.id} className={`timeline-item${job.end === null ? ' is-current' : ''}`}>
                <span className="timeline-dot" aria-hidden="true" />
                <article className="card timeline-card">
                  <header className="timeline-header">
                    <div>
                      <h3>{localize(job.role, lang)}</h3>
                      <p className="timeline-company">
                        {job.company} · {job.location}
                      </p>
                    </div>
                    <div className="timeline-meta">
                      {job.end === null && <span className="chip chip-live">{t('current')}</span>}
                      <p className="mono">{localize(job.period, lang)}</p>
                    </div>
                  </header>
                  <ul className="timeline-tasks">
                    {localize(job.tasks, lang).map((task) => (
                      <li key={task}>{task}</li>
                    ))}
                  </ul>
                </article>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
```

`src/components/css/Experience.css`:

```css
.timeline {
  position: relative;
  max-width: 860px;
  padding-left: 2.5rem;
}

.timeline-rail {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 11px;
  width: 2px;
  background: var(--border);
}

.timeline-progress {
  display: block;
  height: 100%;
  background: linear-gradient(to bottom, var(--accent), var(--accent-2));
  box-shadow: 0 0 12px rgba(0, 229, 255, 0.5);
  transform-origin: top;
}

.timeline-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.timeline-item {
  position: relative;
}

.timeline-dot {
  position: absolute;
  top: 1.6rem;
  left: calc(-2.5rem + 5px);
  width: 14px;
  height: 14px;
  border: 2px solid var(--accent);
  border-radius: 50%;
  background: var(--bg);
}

.timeline-item.is-current .timeline-dot {
  background: var(--accent);
  box-shadow: 0 0 14px rgba(0, 229, 255, 0.8);
}

.timeline-card {
  padding: 1.5rem;
}

.timeline-item.is-current .timeline-card {
  border-color: rgba(0, 229, 255, 0.35);
  box-shadow: 0 0 40px rgba(0, 229, 255, 0.08);
}

.timeline-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.75rem 1.5rem;
  margin-bottom: 1rem;
}

.timeline-header h3 {
  font-size: 1.35rem;
}

.timeline-company {
  margin-top: 0.25rem;
  color: var(--accent);
}

.timeline-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.4rem;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.timeline-tasks {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.timeline-tasks li {
  position: relative;
  padding-left: 1.2rem;
  color: var(--text-muted);
}

.timeline-tasks li::before {
  content: '▹';
  position: absolute;
  left: 0;
  color: var(--accent);
}

@media (max-width: 600px) {
  .timeline {
    padding-left: 1.75rem;
  }

  .timeline-dot {
    left: calc(-1.75rem + 5px);
  }

  .timeline-meta {
    align-items: flex-start;
  }
}
```

- [ ] **Step 4: Ejecutar** — Run: `npx vitest run src/components/Experience.test.jsx` → Expected: PASS.

- [ ] **Step 5: Montar, verificar y commit** — en `App.jsx` añadir `<Experience reducedMotion={reducedMotion} />` tras `<About />`.

Run: `npm test && npm run lint` → Expected: PASS. En el navegador: la línea se rellena con el scroll, la escena se atenúa (`data-dimmed="true"`) y la tarjeta de Macrosad brilla con el chip "Actual".

```bash
git add src/components/Experience.jsx src/components/Experience.test.jsx src/components/css/Experience.css src/App.jsx
git commit -m "Add scroll-driven experience timeline with current job highlight"
```

---

### Task 13: Proyectos (caso de estudio + dashboard en el monitor)

**Files:**
- Create: `src/components/Projects.jsx`, `src/components/DashboardPreview.jsx`, `src/components/css/Projects.css`
- Test: `src/components/Projects.test.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `projects`, `TECH`, `drawDashboard`, `DASHBOARD_LABELS`, `Reveal`, `SectionHeading`
- Produces: `<Projects reducedMotion />`, `<DashboardPreview reducedMotion />` (canvas 2D; visible solo cuando no hay 3D o en pantallas < 1024 px)

- [ ] **Step 1: Test (falla)** — `src/components/Projects.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Projects from './Projects'

describe('Projects', () => {
  it('presents SolarMetrics as a case study with safe external links', () => {
    render(<Projects reducedMotion />)
    expect(screen.getByRole('heading', { level: 3, name: 'SolarMetrics' })).toBeInTheDocument()
    expect(screen.getByText('El problema')).toBeInTheDocument()
    expect(screen.getByText('La solución')).toBeInTheDocument()
    const live = screen.getByRole('link', { name: /Ver demo/ })
    expect(live).toHaveAttribute('href', 'https://solarmetrics.vercel.app')
    expect(live).toHaveAttribute('target', '_blank')
    expect(live).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getByRole('link', { name: /Código/ })).toHaveAttribute('href', 'https://github.com/mdomgar/SolarMetrics')
    expect(screen.getByRole('img', { name: /panel de SolarMetrics/ })).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Stack tecnológico' }).children).toHaveLength(6)
  })
})
```

- [ ] **Step 2: Ejecutar** — Run: `npx vitest run src/components/Projects.test.jsx` → Expected: FAIL.

- [ ] **Step 3: Implementar**

`src/components/DashboardPreview.jsx`:

```jsx
import { useEffect, useRef } from 'react'
import { DASHBOARD_LABELS, drawDashboard } from '../scene/screens/dashboard'
import { useLang, useT } from '../i18n/useLang'

export default function DashboardPreview({ reducedMotion }) {
  const lang = useLang()
  const t = useT()
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined
    const labels = DASHBOARD_LABELS[lang]
    if (reducedMotion) {
      drawDashboard(ctx, 0, canvas.width, canvas.height, true, labels)
      return undefined
    }
    let frame = 0
    let visible = false
    const start = performance.now()
    const loop = (now) => {
      if (!visible) return
      drawDashboard(ctx, (now - start) / 1000, canvas.width, canvas.height, false, labels)
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
  }, [reducedMotion, lang])

  return <canvas ref={ref} className="dashboard-preview" width={1024} height={368} role="img" aria-label={t('dashboardAlt')} />
}
```

`src/components/Projects.jsx`:

```jsx
import { FaGithub } from 'react-icons/fa'
import { FiExternalLink } from 'react-icons/fi'
import { projects } from '../data/projects'
import { TECH } from '../data/skills'
import { localize } from '../data/localize'
import { useLang, useT } from '../i18n/useLang'
import Reveal from './Reveal'
import SectionHeading from './SectionHeading'
import DashboardPreview from './DashboardPreview'
import './css/Projects.css'

export default function Projects({ reducedMotion }) {
  const lang = useLang()
  const t = useT()

  return (
    <section id="projects" className="section projects" aria-labelledby="projects-title">
      <div className="container">
        <SectionHeading id="projects-title" eyebrow="03" title={t('projectsTitle')} />
        {projects.map((project) => (
          <Reveal as="article" key={project.id} className="card project" aria-labelledby={`${project.id}-title`}>
            <header className="project-header">
              <img
                src={project.logo.src}
                width={project.logo.width}
                height={project.logo.height}
                alt=""
                className="project-logo"
                loading="lazy"
              />
              <div>
                <p className="project-tag mono">{localize(project.tag, lang)}</p>
                <h3 id={`${project.id}-title`}>{project.title}</h3>
              </div>
            </header>
            <p className="project-summary">{localize(project.summary, lang)}</p>
            <DashboardPreview reducedMotion={reducedMotion} />
            <dl className="project-story">
              <div>
                <dt>{t('projectProblem')}</dt>
                <dd>{localize(project.problem, lang)}</dd>
              </div>
              <div>
                <dt>{t('projectSolution')}</dt>
                <dd>{localize(project.solution, lang)}</dd>
              </div>
            </dl>
            <ul className="project-stack" aria-label={t('projectStack')}>
              {project.stack.map((id) => {
                const tech = TECH[id]
                return (
                  <li key={id} className="chip">
                    <tech.Icon aria-hidden="true" style={{ color: tech.color }} />
                    {tech.name}
                  </li>
                )
              })}
            </ul>
            <div className="project-links">
              <a className="btn btn-primary" href={project.live} target="_blank" rel="noopener noreferrer">
                <FiExternalLink aria-hidden="true" />
                {t('projectLive')}
                <span className="sr-only"> · {project.title}</span>
              </a>
              <a className="btn" href={project.github} target="_blank" rel="noopener noreferrer">
                <FaGithub aria-hidden="true" />
                {t('projectCode')}
                <span className="sr-only"> · {project.title}</span>
              </a>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
```

`src/components/css/Projects.css`:

```css
.projects {
  min-height: 130vh;
}

.project {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 520px;
  padding: 1.75rem;
}

.project-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.project-logo {
  width: 56px;
  height: 56px;
  border-radius: 14px;
}

.project-tag {
  color: var(--warm);
  font-size: 0.8rem;
}

.project-header h3 {
  font-size: 2rem;
}

.project-summary {
  font-size: 1.05rem;
}

.dashboard-preview {
  display: none;
  width: 100%;
  height: auto;
  border: 1px solid var(--border);
  border-radius: 12px;
}

html[data-scene='static'] .dashboard-preview {
  display: block;
}

@media (max-width: 1023px) {
  .project {
    max-width: none;
  }

  .dashboard-preview {
    display: block;
  }
}

.project-story {
  display: grid;
  gap: 1rem;
}

.project-story dt {
  margin-bottom: 0.25rem;
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 0.8rem;
}

.project-story dd {
  color: var(--text-muted);
}

.project-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.project-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
```

- [ ] **Step 4: Ejecutar** — Run: `npx vitest run src/components/Projects.test.jsx` → Expected: PASS.

- [ ] **Step 5: Montar, verificar y commit** — en `App.jsx` añadir `<Projects reducedMotion={reducedMotion} />` tras `<Experience />`.

Run: `npm test && npm run lint` → Expected: PASS. En el navegador a 1440 px: al llegar a Proyectos la cámara hace zoom al monitor, que cambia de código a dashboard (curva que se dibuja, KPIs que cambian), y el monitor queda a la derecha de la tarjeta sin taparla (ajustar `CAMERA_POSES.projects` si hace falta). Con `?scene=static` y a 375 px el dashboard aparece dentro de la tarjeta.

```bash
git add src/components/Projects.jsx src/components/DashboardPreview.jsx src/components/Projects.test.jsx src/components/css/Projects.css src/App.jsx
git commit -m "Add SolarMetrics case study with live dashboard on the 3D monitor"
```

---

### Task 14: Educación, contacto y pie

**Files:**
- Create: `src/lib/clipboard.js`, `src/components/CopyEmailButton.jsx`, `src/components/Education.jsx`, `src/components/Contact.jsx`, `src/components/css/Education.css`, `src/components/css/Contact.css`
- Test: `src/components/CopyEmailButton.test.jsx`, `src/components/Education.test.jsx`, `src/components/Contact.test.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `education`, `profile`, `Reveal`, `SectionHeading`, `useT`
- Produces: `copyText(text) → Promise<boolean>`; `<CopyEmailButton email />`; `<Education />`; `<Contact />`

- [ ] **Step 1: Tests (fallan)**

`src/components/CopyEmailButton.test.jsx`:

```jsx
import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import CopyEmailButton from './CopyEmailButton'

const EMAIL = 'miguelangelespeluy@gmail.com'

function setClipboard(value) {
  Object.defineProperty(navigator, 'clipboard', { value, configurable: true })
}

afterEach(() => setClipboard(undefined))

describe('CopyEmailButton', () => {
  it('copies the email and confirms it', async () => {
    const writeText = vi.fn().mockResolvedValue()
    setClipboard({ writeText })
    render(<CopyEmailButton email={EMAIL} />)
    fireEvent.click(screen.getByRole('button', { name: 'Copiar email' }))
    expect(await screen.findByText('Email copiado')).toBeInTheDocument()
    expect(writeText).toHaveBeenCalledWith(EMAIL)
  })

  it('shows the email as a mailto link when the browser refuses to copy', async () => {
    setClipboard({ writeText: vi.fn().mockRejectedValue(new Error('denied')) })
    render(<CopyEmailButton email={EMAIL} />)
    fireEvent.click(screen.getByRole('button', { name: 'Copiar email' }))
    expect(await screen.findByRole('link', { name: EMAIL })).toHaveAttribute('href', `mailto:${EMAIL}`)
  })

  it('shows the email as a mailto link when there is no clipboard API', async () => {
    setClipboard(undefined)
    render(<CopyEmailButton email={EMAIL} />)
    fireEvent.click(screen.getByRole('button', { name: 'Copiar email' }))
    expect(await screen.findByText(/No se pudo copiar/)).toBeInTheDocument()
  })
})
```

`src/components/Education.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Education from './Education'

describe('Education', () => {
  it('shows both degrees with their grades out of 10', () => {
    render(<Education />)
    expect(screen.getByRole('heading', { level: 3, name: /Desarrollo de Aplicaciones Multiplataforma/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: /Administración de Sistemas Informáticos en Red/ })).toBeInTheDocument()
    expect(screen.getByText('9.7 / 10')).toBeInTheDocument()
    expect(screen.getByText('9.4 / 10')).toBeInTheDocument()
  })
})
```

`src/components/Contact.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Contact from './Contact'

describe('Contact', () => {
  it('offers email, LinkedIn and GitHub', () => {
    render(<Contact />)
    expect(screen.getByRole('heading', { level: 2, name: '¿Hablamos?' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Escribir email' })).toHaveAttribute('href', 'mailto:miguelangelespeluy@gmail.com')
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/mdomgar')
  })
})
```

- [ ] **Step 2: Ejecutar** — Run: `npx vitest run src/components/CopyEmailButton.test.jsx src/components/Education.test.jsx src/components/Contact.test.jsx` → Expected: FAIL.

- [ ] **Step 3: Implementar**

`src/lib/clipboard.js`:

```js
export async function copyText(text) {
  if (!navigator.clipboard?.writeText) return false
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
```

`src/components/CopyEmailButton.jsx`:

```jsx
import { useEffect, useState } from 'react'
import { FiCopy } from 'react-icons/fi'
import { copyText } from '../lib/clipboard'
import { useT } from '../i18n/useLang'

export default function CopyEmailButton({ email }) {
  const t = useT()
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    if (status !== 'copied') return undefined
    const id = setTimeout(() => setStatus('idle'), 2500)
    return () => clearTimeout(id)
  }, [status])

  const handleClick = async () => {
    setStatus((await copyText(email)) ? 'copied' : 'failed')
  }

  return (
    <div className="copy-email">
      <button type="button" className="btn btn-primary" onClick={handleClick}>
        <FiCopy aria-hidden="true" />
        {t('copyEmail')}
      </button>
      <p className="copy-email-status" role="status">
        {status === 'copied' && t('emailCopied')}
        {status === 'failed' && (
          <>
            {t('copyFailed')}{' '}
            <a href={`mailto:${email}`} className="mono">
              {email}
            </a>
          </>
        )}
      </p>
    </div>
  )
}
```

`src/components/Education.jsx`:

```jsx
import { education } from '../data/education'
import { localize } from '../data/localize'
import { useLang, useT } from '../i18n/useLang'
import Reveal from './Reveal'
import SectionHeading from './SectionHeading'
import './css/Education.css'

export default function Education() {
  const lang = useLang()
  const t = useT()

  return (
    <section id="education" className="section" aria-labelledby="education-title">
      <div className="container">
        <SectionHeading id="education-title" eyebrow="04" title={t('educationTitle')} />
        <Reveal as="ul" className="education-grid">
          {education.map((item) => (
            <li key={item.id} className="card education-card">
              <p className="education-period mono">{localize(item.period, lang)}</p>
              <h3>{localize(item.degree, lang)}</h3>
              <p className="education-place">{item.place}</p>
              <div className="education-footer">
                <p className="education-grade">{item.grade}</p>
                <p className="education-note">{localize(item.note, lang)}</p>
              </div>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
```

`src/components/css/Education.css`:

```css
.education-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  max-width: 980px;
}

.education-card {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 1.75rem;
}

.education-period {
  color: var(--accent);
  font-size: 0.8rem;
}

.education-card h3 {
  font-size: 1.3rem;
  line-height: 1.25;
}

.education-place {
  color: var(--text-muted);
}

.education-footer {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}

.education-grade {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 600;
  color: var(--warm);
}

.education-note {
  color: var(--text-muted);
  font-size: 0.9rem;
}
```

`src/components/Contact.jsx`:

```jsx
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
      <footer className="footer container">
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
        <p className="mono">{t('footerBuilt')}</p>
      </footer>
    </section>
  )
}
```

`src/components/css/Contact.css`:

```css
.contact {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100svh;
  padding-bottom: 2rem;
}

.contact-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin-block: auto;
  text-align: center;
}

.contact-title {
  font-size: clamp(3.5rem, 12vw, 9rem);
  font-weight: 700;
  line-height: 0.95;
  background: linear-gradient(90deg, var(--text), var(--accent) 60%, var(--accent-2));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.contact-text {
  max-width: 560px;
  color: var(--text-muted);
  font-size: 1.1rem;
}

.copy-email {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
}

.copy-email-status {
  min-height: 1.5em;
  color: var(--success);
  font-size: 0.9rem;
}

.copy-email-status a {
  color: var(--accent);
  text-decoration: underline;
}

.contact-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
}

.footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: 4rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 0.85rem;
}
```

- [ ] **Step 4: Ejecutar** — Run: `npx vitest run src/components/CopyEmailButton.test.jsx src/components/Education.test.jsx src/components/Contact.test.jsx` → Expected: PASS (5 tests).

- [ ] **Step 5: Montar** — en `App.jsx` importar `Education` y `Contact` y añadirlos tras `<Projects />`:

```jsx
<Education />
<Contact />
```

- [ ] **Step 6: Verificar y commit**

Run: `npm test && npm run lint && npm run build` → Expected: PASS.

```bash
git add src/lib/clipboard.js src/components/CopyEmailButton.jsx src/components/CopyEmailButton.test.jsx src/components/Education.jsx src/components/Education.test.jsx src/components/Contact.jsx src/components/Contact.test.jsx src/components/css/Education.css src/components/css/Contact.css src/App.jsx
git commit -m "Add education cards, contact section with copy-email and footer"
```

---

### Task 15: Microinteracciones (botones magnéticos, foco de luz e inclinación)

**Files:**
- Create: `src/hooks/useMicroInteractions.js`
- Test: `src/hooks/useMicroInteractions.test.jsx`
- Modify: `src/styles/global.css`, `src/test/setup.js`, `src/components/About.jsx`, `src/components/Projects.jsx`, `src/components/css/About.css`, `src/components/css/Projects.css`, `src/App.jsx`

**Interfaces:**
- Consumes: clases `.card` y `.btn` (Task 2), `ready` y `reducedMotion` de `App`
- Produces: `useMicroInteractions(enabled: boolean)`. Con un único listener delegado en `document`:
  - En `.card` escribe `--mx`/`--my` (posición del cursor) para el foco de luz.
  - En `.btn` aplica `translate` (efecto magnético).
  - En `[data-tilt]` aplica `rotate` (inclinación 3D).

  Usa las propiedades CSS individuales `translate` y `rotate` para no pisar el `transform` inline que dejan las animaciones de GSAP.

- [ ] **Step 1: Test (falla)** — `src/hooks/useMicroInteractions.test.jsx`:

```jsx
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { mockMatchMedia } from '../test/mocks'
import { useMicroInteractions } from './useMicroInteractions'

function Page({ enabled }) {
  useMicroInteractions(enabled)
  return (
    <>
      <article className="card" data-tilt data-testid="card">
        <a className="btn" href="#x">
          Botón
        </a>
      </article>
      <p data-testid="outside">fuera</p>
    </>
  )
}

describe('useMicroInteractions', () => {
  it('tracks the cursor inside cards, tilts them and pulls buttons towards it', () => {
    render(<Page enabled />)
    fireEvent.pointerMove(screen.getByRole('link'), { clientX: 40, clientY: 20 })
    const card = screen.getByTestId('card')
    expect(card.style.getPropertyValue('--mx')).toBe('40px')
    expect(card.style.getPropertyValue('--my')).toBe('20px')
    expect(card.style.rotate).not.toBe('')
    expect(screen.getByRole('link').style.translate).not.toBe('')
  })

  it('releases buttons and cards when the cursor leaves them', () => {
    render(<Page enabled />)
    fireEvent.pointerMove(screen.getByRole('link'), { clientX: 40, clientY: 20 })
    fireEvent.pointerMove(screen.getByTestId('outside'), { clientX: 400, clientY: 400 })
    expect(screen.getByRole('link').style.translate).toBe('')
    expect(screen.getByTestId('card').style.rotate).toBe('')
  })

  it('does nothing when disabled or on touch screens', () => {
    const { unmount } = render(<Page enabled={false} />)
    fireEvent.pointerMove(screen.getByRole('link'), { clientX: 40, clientY: 20 })
    expect(screen.getByTestId('card').style.getPropertyValue('--mx')).toBe('')
    unmount()

    mockMatchMedia((query) => query === '(pointer: coarse)')
    render(<Page enabled />)
    fireEvent.pointerMove(screen.getByRole('link'), { clientX: 40, clientY: 20 })
    expect(screen.getByTestId('card').style.getPropertyValue('--mx')).toBe('')
  })
})
```

Añadir al principio de `src/test/setup.js` (jsdom puede no traer `PointerEvent` con coordenadas):

```js
if (!window.PointerEvent) window.PointerEvent = window.MouseEvent
```

- [ ] **Step 2: Ejecutar** — Run: `npx vitest run src/hooks/useMicroInteractions.test.jsx` → Expected: FAIL.

- [ ] **Step 3: Implementar** — `src/hooks/useMicroInteractions.js`:

```js
import { useEffect } from 'react'

const MAX_TILT_DEG = 6

export function useMicroInteractions(enabled) {
  useEffect(() => {
    if (!enabled || window.matchMedia('(pointer: coarse)').matches) return undefined
    let magnet = null
    let tilted = null

    const release = () => {
      if (magnet) magnet.style.translate = ''
      if (tilted) tilted.style.rotate = ''
      magnet = null
      tilted = null
    }

    const onMove = (event) => {
      const target = event.target instanceof Element ? event.target : null
      const card = target?.closest('.card')
      const button = target?.closest('.btn')
      const tilt = target?.closest('[data-tilt]')

      if (magnet && magnet !== button) {
        magnet.style.translate = ''
        magnet = null
      }
      if (tilted && tilted !== tilt) {
        tilted.style.rotate = ''
        tilted = null
      }

      if (card) {
        const rect = card.getBoundingClientRect()
        card.style.setProperty('--mx', `${event.clientX - rect.left}px`)
        card.style.setProperty('--my', `${event.clientY - rect.top}px`)
      }

      if (button) {
        const rect = button.getBoundingClientRect()
        const dx = (event.clientX - (rect.left + rect.width / 2)) * 0.25
        const dy = (event.clientY - (rect.top + rect.height / 2)) * 0.35
        button.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`
        magnet = button
      }

      if (tilt) {
        const rect = tilt.getBoundingClientRect()
        const nx = rect.width ? (event.clientX - rect.left) / rect.width - 0.5 : 0
        const ny = rect.height ? (event.clientY - rect.top) / rect.height - 0.5 : 0
        const angle = Math.min(1, Math.hypot(nx, ny) * 2) * MAX_TILT_DEG
        tilt.style.rotate = `${(-ny).toFixed(3)} ${nx.toFixed(3)} 0 ${angle.toFixed(2)}deg`
        tilted = tilt
      }
    }

    document.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', release)
    return () => {
      document.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', release)
      release()
    }
  }, [enabled])
}
```

(En jsdom `getBoundingClientRect` devuelve ceros, así que el ángulo sale `0deg`; por eso el test solo comprueba que `rotate` no quede vacío.)

- [ ] **Step 4: Ejecutar** — Run: `npx vitest run src/hooks/useMicroInteractions.test.jsx` → Expected: PASS (3 tests).

- [ ] **Step 5: Estilos** — añadir al final de `src/styles/global.css` (antes del bloque `prefers-reduced-motion`):

```css
.card:hover {
  background-image: radial-gradient(360px circle at var(--mx, 50%) var(--my, 50%), rgba(0, 229, 255, 0.09), transparent 45%);
  border-color: var(--border-strong);
}

.btn {
  transition: transform 0.25s var(--ease-out), translate 0.25s var(--ease-out), background 0.25s, border-color 0.25s,
    box-shadow 0.25s;
}

[data-tilt] {
  transition: rotate 0.35s var(--ease-out);
}
```

En `src/components/css/About.css` añadir a `.bento`: `perspective: 1000px;`. En `src/components/css/Projects.css` añadir `.projects .container { perspective: 1000px; }`.

- [ ] **Step 6: Marcar tarjetas inclinables**
  - En `About.jsx`, añadir `data-tilt` a los `<article>` `bento-now`, `bento-location` y a cada `bento-stat`. La bio y el stack son demasiado grandes para inclinarse.
  - En `Projects.jsx`, añadir `data-tilt` al `<Reveal as="article" ...>`.

- [ ] **Step 7: Activar en `App.jsx`**

```jsx
import { useMicroInteractions } from './hooks/useMicroInteractions'
```

y dentro de `App()`, junto a `useSmoothScroll`:

```jsx
useMicroInteractions(ready && !reducedMotion)
```

- [ ] **Step 8: Verificar y commit**

Run: `npm test && npm run lint` → Expected: PASS. En el navegador, comprobar tres cosas:
- Los botones se desplazan hacia el cursor y vuelven a su sitio al salir.
- Las tarjetas muestran un halo cian que sigue al ratón.
- Las tarjetas pequeñas del bento y la de SolarMetrics se inclinan ligeramente.

En móvil, o con movimiento reducido, no pasa nada de esto.

```bash
git add src/hooks/useMicroInteractions.js src/hooks/useMicroInteractions.test.jsx src/styles/global.css src/test/setup.js src/components/About.jsx src/components/Projects.jsx src/components/css/About.css src/components/css/Projects.css src/App.jsx
git commit -m "Add magnetic buttons, card spotlight and tilt micro-interactions"
```

---

### Task 16: README, sincronizar el spec y verificación final

**Files:**
- Modify: `README.md`, `docs/superpowers/specs/2026-09-30-portfolio-3d-redesign-design.md`

- [ ] **Step 1: README** — reemplazar `README.md`:

````markdown
# Portfolio · Miguel Ángel Domínguez García

Portfolio personal con un escritorio de developer en 3D (React Three Fiber) detrás de un contenido HTML accesible: sobre mí, experiencia, proyectos, educación y contacto.

## Stack

React 19 · Vite 7 · three.js + @react-three/fiber/drei/postprocessing · GSAP + ScrollTrigger · Lenis · zustand · Vitest + Testing Library

## Scripts

```bash
npm install
npm run dev      # servidor de desarrollo
npm test         # tests
npm run lint     # ESLint
npm run build    # build de producción en dist/
```

## Contenido

Todo el texto está en `src/data/` (contenido) y `src/i18n/strings.js` (interfaz), en español e inglés.

## Calidad del 3D

La calidad se detecta sola (`src/scene/quality.js`). Para probar un nivel concreto añade `?scene=high|medium|low|static` a la URL; `static` muestra el fondo sin WebGL.

## Imágenes

`scripts/process-images.py` genera `public/img/*` (foto recortada, logo e imagen para redes) a partir de `scripts/source/portrait-original.webp`:

```bash
python -m venv scripts/.venv
scripts/.venv/Scripts/python -m pip install "rembg[cpu]" pillow
scripts/.venv/Scripts/python scripts/process-images.py scripts/source/portrait-original.webp
```
````

- [ ] **Step 2: Sincronizar el spec con lo implementado** — en `docs/superpowers/specs/2026-09-30-portfolio-3d-redesign-design.md`:
  - En "Flujo de datos", sustituir la línea del **Monitor** por: "`Monitors` pinta el dashboard de SolarMetrics en la `CanvasTexture` de la pantalla principal durante la sección de proyectos (sin DOM dentro del 3D); `DashboardPreview` reutiliza el mismo dibujo en un canvas 2D cuando no hay 3D o en pantallas < 1024 px."
  - En "Rendimiento", cambiar "en `static` se muestra `desk-fallback.webp`" por "en `static` se muestra `SceneFallback` (degradados cian/violeta y rejilla en perspectiva hechos en CSS)", y "recorte WebP/AVIF" por "recorte WebP (1086 px y 540 px)".
  - En "Estructura", cambiar `desk-fallback.webp` por `solarmetrics-logo.webp` en `public/img/`.

- [ ] **Step 3: Verificación automática**

Run: `npm test && npm run lint && npm run build`
Expected: todos los tests PASS, 0 errores de lint y build OK. Anotar el tamaño de los chunks (el de `SceneCanvas` se descarga aparte).

- [ ] **Step 4: Verificación visual** (navegador integrado, `npm run dev`)

Comprobar y hacer captura de cada punto:
1. 1440×900: preloader → hero (nombre, foto con contorno, rol escribiéndose, escritorio detrás) → about (órbita de cámara) → experiencia (escena atenuada, línea rellenándose) → proyectos (zoom al monitor con dashboard) → educación → contacto (cámara alejada).
2. Los enlaces de la navbar llevan a cada sección sin que la navbar tape el título, y marcan la sección activa.
3. 768×1024 y 375×812 (`resize_window` con los presets `tablet` y `mobile`): sin scroll horizontal, menú hamburguesa funcional, foto y texto del hero sin solaparse, dashboard 2D visible en proyectos.
4. `?scene=static`: fondo CSS sin canvas y todo el contenido legible.
5. Movimiento reducido (DevTools → Rendering → Emulate `prefers-reduced-motion: reduce`, o `matchMedia` forzado): sin typewriter, contadores en su valor final y cámara fija.
6. Consola sin errores ni warnings de React.
7. Volver el viewport a `desktop` al terminar.

- [ ] **Step 5: Lighthouse**

Con `npm run build && npm run preview` en marcha:

```bash
npx lighthouse http://localhost:4173 --preset=desktop --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=./lighthouse-desktop.json --chrome-flags="--headless"
```

Expected: rendimiento ≥ 80 y accesibilidad ≥ 95. Si no hay Chrome disponible, avisar a Miguel y medir con PageSpeed Insights tras desplegar la rama en Vercel. No commitear `lighthouse-desktop.json`.

- [ ] **Step 6: Commit**

```bash
git add README.md docs/superpowers/specs/2026-09-30-portfolio-3d-redesign-design.md
git commit -m "Document the new portfolio and sync the spec with phase 1"
```
