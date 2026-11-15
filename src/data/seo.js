import { localize } from './localize.js'
import { getCase } from './cases/index.js'

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
      es: 'La página que buscas no existe o se ha movido. Vuelve al inicio para ver mis servicios y casos.',
      en: 'The page you are looking for does not exist or has moved. Go back home to see my services and case studies.',
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
