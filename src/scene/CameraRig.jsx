import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { useSceneStore } from '../store/sceneStore'
import { dampVec3, getPose } from './cameraPoses'

export default function CameraRig({ reducedMotion }) {
  const camera = useThree((state) => state.camera)
  const lookAt = useRef(new Vector3(...getPose('hero').target))

  useFrame((state, delta) => {
    const pose = getPose(reducedMotion ? 'hero' : useSceneStore.getState().section)
    const px = reducedMotion ? 0 : state.pointer.x * 0.18
    const py = reducedMotion ? 0 : state.pointer.y * 0.1
    const lambda = reducedMotion ? 1000 : 2.2
    dampVec3(camera.position, [pose.position[0] + px, pose.position[1] + py, pose.position[2]], lambda, delta)
    dampVec3(lookAt.current, pose.target, lambda, delta)
    camera.lookAt(lookAt.current)
  })

  return null
}
