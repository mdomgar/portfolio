import { describe, expect, it } from 'vitest'
import { fill, formatDate, formatMonthYear } from './format'

describe('dates', () => {
  it('shows month and year without the "de" connector', () => {
    expect(formatMonthYear('2026-10-01', 'es')).toBe('octubre 2026')
    expect(formatMonthYear('2026-10-01', 'en')).toBe('October 2026')
  })

  it('shows full dates in each language, without timezone drift', () => {
    expect(formatDate('2026-09-27', 'es')).toBe('27 de septiembre de 2026')
    expect(formatDate('2026-09-27', 'en')).toBe('27 September 2026')
  })
})

describe('fill', () => {
  it('replaces named placeholders and leaves unknown ones alone', () => {
    expect(fill('Paso {current} de {total}', { current: 2, total: 4 })).toBe('Paso 2 de 4')
    expect(fill('Hola {name} {x}', { name: 'Ana' })).toBe('Hola Ana {x}')
  })
})
