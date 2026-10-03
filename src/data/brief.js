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
