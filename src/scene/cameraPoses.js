import { MathUtils } from 'three'
import { CAMERA_POSES, DEFAULT_POSE } from './poses'

export { CAMERA_POSES }

export function getPose(id) {
  return CAMERA_POSES[id] ?? CAMERA_POSES[DEFAULT_POSE]
}

export function dampVec3(current, target, lambda, delta) {
  current.x = MathUtils.damp(current.x, target[0], lambda, delta)
  current.y = MathUtils.damp(current.y, target[1], lambda, delta)
  current.z = MathUtils.damp(current.z, target[2], lambda, delta)
  return current
}
