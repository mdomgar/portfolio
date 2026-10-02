import { describe, expect, it } from 'vitest'
import { Vector3 } from 'three'
import { CAMERA_POSES, dampVec3, getPose } from './cameraPoses'

describe('getPose', () => {
  it('returns the requested pose', () => {
    expect(getPose('brief')).toBe(CAMERA_POSES.brief)
  })

  it('falls back to the open-desk pose for unknown ids', () => {
    expect(getPose('nope')).toBe(CAMERA_POSES['hero-q4'])
  })
})

describe('dampVec3', () => {
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
