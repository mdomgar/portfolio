const LOCALES = { es: 'es-ES', en: 'en-GB' }

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
