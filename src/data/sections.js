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

// Navbar items. The Lab arrives in phase B (spec §3): keep it here, disabled.
export const NAV_ITEMS = [
  { id: 'servicios', label: { es: 'Servicios', en: 'Services' }, enabled: true },
  { id: 'casos', label: { es: 'Casos', en: 'Case studies' }, enabled: true },
  { id: 'proceso', label: { es: 'Cómo trabajo', en: 'How I work' }, enabled: true },
  { id: 'quien-soy', label: { es: 'Quién soy', en: 'About me' }, enabled: true },
  { id: 'lab', label: { es: 'Lab', en: 'Lab' }, enabled: false },
]
