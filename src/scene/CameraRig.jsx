import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { selectPoseId, useSceneStore } from '../store/sceneStore'
import { dampVec3, getPose } from './cameraPoses'
import { DEFAULT_POSE } from './poses'

export default function CameraRig({ reducedMotion }) {
  const camera = useThree((state) => state.camera)
  const lookAt = useRef(new Vector3(...getPose(DEFAULT_POSE).target))

  useFrame((state, delta) => {
    const store = useSceneStore.getState()
    const pose = getPose(selectPoseId(store))
    const snap = store.consumeCameraSnap()
    const parallax = reducedMotion ? 0 : (pose.parallax ?? 1)
    const px = state.pointer.x * 0.18 * parallax
    const py = state.pointer.y * 0.1 * parallax
    const lambda = reducedMotion || snap ? 1000 : 2.2
    dampVec3(camera.position, [pose.position[0] + px, pose.position[1] + py, pose.position[2]], lambda, delta)
    dampVec3(lookAt.current, pose.target, lambda, delta)
    camera.lookAt(lookAt.current)
  })

  return null
}
