import { localize } from './localize.js'
import { getCase } from './cases/index.js'

const PAGES = {
  '/': {
    title: {
      es: 'Miguel Ángel Domínguez · Web developer',
      en: 'Miguel Ángel Domínguez · Web developer',
    },
    description: {
      es: 'Web developer en Jaén. Programo aplicaciones y herramientas web con React y Node.js. Trayectoria, proyectos y contacto.',
      en: 'Web developer in Jaén, Spain. I build web applications and tools with React and Node.js. Career, projects and contact.',
    },
  },
  '/aviso-legal': {
    title: { es: 'Aviso legal · Miguel Ángel Domínguez', en: 'Legal notice · Miguel Ángel Domínguez' },
    description: {
      es: 'Titular, condiciones de uso, propiedad intelectual y legislación aplicable de la web de Miguel Ángel Domínguez García.',
      en: 'Owner, terms of use, intellectual property and applicable law of the website of Miguel Ángel Domínguez García.',
    },
  },
  '/404': {
    title: { es: 'Página no encontrada · Miguel Ángel Domínguez', en: 'Page not found · Miguel Ángel Domínguez' },
    description: {
      es: 'La página que buscas no existe o se ha movido. Vuelve al inicio.',
      en: 'The page you are looking for does not exist or has moved. Go back home.',
    },
    noindex: true,
  },
}

const CASE_PATH = /^\/casos\/([a-z0-9-]+)$/
const CASE_STUDY = { es: 'Caso de estudio', en: 'Case study' }

function caseSeo(slug, lang) {
  const item = getCase(slug)
  if (!item) return null
  return {
    title: `${item.name} · ${localize(CASE_STUDY, lang)} · Miguel Ángel Domínguez`,
    description: `${localize(item.label, lang)}. ${localize(item.tagline, lang)}`,
    image: `/img/og-${slug}.jpg`,
    noindex: false,
  }
}

export function getPageSeo(path, lang = 'es') {
  const slug = CASE_PATH.exec(path)?.[1]
  if (slug) return caseSeo(slug, lang)
  const page = PAGES[path]
  if (!page) return null
  return {
    title: localize(page.title, lang),
    description: localize(page.description, lang),
    image: page.image,
    noindex: Boolean(page.noindex),
  }
}
