import { MathUtils } from 'three'

export const CAMERA_POSES = {
  hero: { position: [1.1, 1.55, 3.4], target: [0.2, 1.0, 0] },
  about: { position: [-2.6, 1.9, 2.4], target: [0, 0.95, 0] },
  experience: { position: [2.4, 2.3, 2.8], target: [0, 0.9, 0] },
  projects: { position: [-0.45, 1.14, 1.4], target: [-0.45, 1.14, -0.22] },
  education: { position: [2.8, 1.5, 1.4], target: [0, 1.0, 0] },
  contact: { position: [0, 2.6, 5.4], target: [0, 0.9, 0] },
}

export function getPose(section) {
  return CAMERA_POSES[section] ?? CAMERA_POSES.hero
}

export function dampVec3(current, target, lambda, delta) {
  current.x = MathUtils.damp(current.x, target[0], lambda, delta)
  current.y = MathUtils.damp(current.y, target[1], lambda, delta)
  current.z = MathUtils.damp(current.z, target[2], lambda, delta)
  return current
}
