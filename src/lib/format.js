const LOCALES = { es: 'es-ES', en: 'en-GB' }

export function formatNumber(value, decimals = 0, lang = 'es') {
  return new Intl.NumberFormat(LOCALES[lang] ?? LOCALES.es, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}
