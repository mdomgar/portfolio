import { experience } from './experience'
import { localize } from './localize'

// The four acts of the show, in order. Each one points at a job in experience.js.
export const ACTS = [
  { id: 'taller', experienceId: 'mecaofi', word: { es: 'Taller', en: 'Workshop' }, color: '#ff6b2c' },
  { id: 'servidores', experienceId: 'grupo-avanza', word: { es: 'Servidores', en: 'Servers' }, color: '#35d691' },
  { id: 'erp', experienceId: 'intelec', word: { es: 'ERP', en: 'ERP' }, color: '#b78cff' },
  { id: 'codigo', experienceId: 'macrosad', word: { es: 'Código', en: 'Code' }, color: '#e4f23a' },
]

// Each act merged with its job, with every text localized for one language.
export function getActs(lang) {
  return ACTS.map((act) => {
    const job = experience.find((item) => item.id === act.experienceId)
    return {
      id: act.id,
      experienceId: act.experienceId,
      word: localize(act.word, lang),
      color: act.color,
      role: localize(job.role, lang),
      company: job.company,
      period: localize(job.period, lang),
      tasks: localize(job.tasks, lang),
    }
  })
}
