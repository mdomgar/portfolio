import { describe, expect, it } from 'vitest'
import { briefTagLabels, briefTimelines, briefTypes } from './brief'
import { BRIEF_TAGS, BRIEF_TIMELINES, BRIEF_TYPES } from '../lib/briefSchema'

const isLocalized = (v) => Boolean(v) && typeof v.es === 'string' && typeof v.en === 'string' && v.es && v.en

describe('brief copy', () => {
  it('labels every type, with a hint, in both languages', () => {
    expect(briefTypes.map((type) => type.id)).toEqual(BRIEF_TYPES)
    for (const type of briefTypes) expect(isLocalized(type.label) && isLocalized(type.hint), type.id).toBeTruthy()
    expect(briefTypes.map((type) => type.label.es)).toEqual(['Una web', 'Una herramienta', 'Una app', 'Aún no lo sé'])
  })

  it('labels every timeline and every quick tag', () => {
    expect(briefTimelines.map((item) => item.id)).toEqual(BRIEF_TIMELINES)
    expect(briefTimelines.map((item) => item.label.es)).toEqual(['Lo antes posible', 'En 1–3 meses', 'Sin prisa'])
    const tagIds = Object.values(BRIEF_TAGS).flat()
    expect(Object.keys(briefTagLabels).sort()).toEqual([...tagIds].sort())
    for (const id of tagIds) expect(isLocalized(briefTagLabels[id]), id).toBeTruthy()
    expect(briefTagLabels.redo.es).toBe('Ya tengo web y quiero renovarla')
    expect(briefTagLabels.booking.es).toBe('Necesito reservas')
    expect(briefTagLabels.shop.es).toBe('Necesito tienda online')
  })
})
