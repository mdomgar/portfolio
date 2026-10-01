import { describe, expect, it } from 'vitest'
import { Vector3 } from 'three'
import { CAMERA_POSES, dampVec3, getPose } from './cameraPoses'
import { SECTION_IDS } from '../data/sections'

describe('camera poses', () => {
  it('defines a pose for every section', () => {
    for (const id of SECTION_IDS) expect(CAMERA_POSES[id], id).toBeDefined()
  })

  it('falls back to the hero pose for unknown sections', () => {
    expect(getPose('nope')).toBe(CAMERA_POSES.hero)
  })

  it('moves a vector towards the target without overshooting', () => {
    const v = new Vector3(0, 0, 0)
    dampVec3(v, [10, -10, 4], 2, 1 / 60)
    expect(v.x).toBeGreaterThan(0)
    expect(v.x).toBeLessThan(10)
    expect(v.y).toBeLessThan(0)
    for (let i = 0; i < 600; i += 1) dampVec3(v, [10, -10, 4], 2, 1 / 60)
    expect(v.x).toBeCloseTo(10, 3)
    expect(v.y).toBeCloseTo(-10, 3)
    expect(v.z).toBeCloseTo(4, 3)
  })
})
