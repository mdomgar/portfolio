import { describe, expect, it } from 'vitest'
import { SECTION_IDS } from '../data/sections'
import { services } from '../data/services'
import {
  CAMERA_POSES,
  DEFAULT_POSE,
  DIMMED_POSES,
  isPhoneLit,
  mainScreenFor,
  resolvePoseId,
  SECTION_POSES,
} from './poses'

describe('camera poses', () => {
  it('defines exactly the poses in the spec, each with a position and a target', () => {
    expect(Object.keys(CAMERA_POSES).sort()).toEqual(
      ['about', 'brief', 'case', 'hero-q1', 'hero-q2', 'hero-q3', 'hero-q4', 'process', 'service-app', 'service-tool', 'service-web'].sort(),
    )
    for (const [id, pose] of Object.entries(CAMERA_POSES)) {
      expect(pose.position, id).toHaveLength(3)
      expect(pose.target, id).toHaveLength(3)
    }
    expect(CAMERA_POSES[DEFAULT_POSE]).toBeDefined()
  })

  it('maps every home section, the case pages and every service to a pose', () => {
    for (const id of [...SECTION_IDS, 'case']) expect(CAMERA_POSES[SECTION_POSES[id]], id).toBeDefined()
    for (const service of services) expect(CAMERA_POSES[service.pose], service.id).toBeDefined()
  })

  it('dims only the text-heavy poses', () => {
    expect([...DIMMED_POSES].sort()).toEqual(['about', 'case', 'process'])
  })
})

describe('resolvePoseId', () => {
  it('follows the visible section', () => {
    expect(resolvePoseId({ section: 'proceso', sceneCue: null })).toBe('process')
    expect(resolvePoseId({ section: 'hero', sceneCue: null })).toBe('hero-q4')
  })

  it('lets a scene cue win over the section', () => {
    expect(resolvePoseId({ section: 'servicios', sceneCue: 'service-app' })).toBe('service-app')
  })

  it('ignores unknown cues and sections', () => {
    expect(resolvePoseId({ section: 'proceso', sceneCue: 'toString' })).toBe('process')
    expect(resolvePoseId({ section: 'nope', sceneCue: null })).toBe(DEFAULT_POSE)
  })
})

describe('screens and phone per pose', () => {
  it('shows a website being built, then the dashboard, then code', () => {
    expect(mainScreenFor('hero-q1')).toBe('site-build')
    expect(mainScreenFor('service-web')).toBe('site-build')
    expect(mainScreenFor('hero-q2')).toBe('dashboard')
    expect(mainScreenFor('service-tool')).toBe('dashboard')
    expect(mainScreenFor('about')).toBe('code')
  })

  it('turns the phone on from the third question onwards', () => {
    expect(isPhoneLit('hero-q1')).toBe(false)
    expect(isPhoneLit('hero-q2')).toBe(false)
    expect(isPhoneLit('hero-q3')).toBe(true)
    expect(isPhoneLit('service-app')).toBe(true)
    expect(isPhoneLit('process')).toBe(true)
  })
})
