export const DEFAULT_LANG = 'es'

const isLocalized = (value) => Boolean(value) && typeof value === 'object' && 'es' in value && 'en' in value

export function localize(value, lang = DEFAULT_LANG) {
  if (!isLocalized(value)) return value
  return value[lang] ?? value[DEFAULT_LANG]
}
