// Pure data + selectors, safe for the main chunk (no three.js import).
export const CAMERA_POSES = {
  'hero-q1': { position: [-0.4, 1.14, 2.0], target: [-0.4, 1.14, -0.22], parallax: 0.35 },
  'hero-q2': { position: [-0.34, 1.12, 2.0], target: [-0.34, 1.12, -0.22], parallax: 0.35 },
  'hero-q3': { position: [0.5, 1.0, 0.5], target: [0.5, 0.76, 0.2], parallax: 0.3 },
  'hero-q4': { position: [-0.9, 1.4, 3.9], target: [-1.0, 1.0, 0] },
  'service-web': { position: [-0.4, 1.14, 2.0], target: [-0.4, 1.14, -0.22], parallax: 0.35 },
  'service-tool': { position: [-0.34, 1.12, 2.0], target: [-0.34, 1.12, -0.22], parallax: 0.35 },
  'service-app': { position: [0.5, 1.0, 0.5], target: [0.5, 0.76, 0.2], parallax: 0.3 },
  process: { position: [2.4, 2.3, 2.8], target: [0, 0.9, 0] },
  about: { position: [-2.6, 1.9, 2.4], target: [0, 0.95, 0] },
  case: { position: [2.8, 1.5, 1.4], target: [0, 1.0, 0] },
  brief: { position: [0, 2.6, 5.4], target: [0, 0.9, 0] },
}

export const DEFAULT_POSE = 'hero-q4'

// Home section ids (DOM) plus the 'case' page section used by case, legal and 404 pages.
export const SECTION_POSES = {
  hero: 'hero-q4',
  servicios: 'service-web',
  casos: 'case',
  proceso: 'process',
  'quien-soy': 'about',
  ahora: 'about',
  brief: 'brief',
  case: 'case',
}

export const DIMMED_POSES = new Set(['process', 'case'])

const MAIN_SCREENS = {
  'hero-q1': 'site-build',
  'service-web': 'site-build',
  'hero-q2': 'dashboard',
  'service-tool': 'dashboard',
}

export function resolvePoseId({ section, sceneCue }) {
  if (sceneCue && Object.hasOwn(CAMERA_POSES, sceneCue)) return sceneCue
  return SECTION_POSES[section] ?? DEFAULT_POSE
}

export function mainScreenFor(poseId) {
  return MAIN_SCREENS[poseId] ?? 'code'
}

export function isPhoneLit(poseId) {
  return poseId !== 'hero-q1' && poseId !== 'hero-q2'
}
