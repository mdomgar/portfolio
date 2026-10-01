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
