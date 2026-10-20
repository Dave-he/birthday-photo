'use client'

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { getCameraFraming } from '@/lib/cameraFraming'

/**
 * Keeps the whole stage in frame at any viewport shape.
 *
 * The camera used to be placed for a 16:9 desktop and never adjusted, so a
 * phone cropped the title off the top and the gifts off the bottom. The
 * rig now derives the distance and the field of view from the viewport's
 * aspect ratio — and it keeps the direction the visitor is looking from, so
 * a rotation does not throw their view away when the window changes.
 */
export default function CameraRig() {
  const camera = useThree((state) => state.camera)
  const size = useThree((state) => state.size)

  useEffect(() => {
    // The scene always uses a perspective camera; the guard keeps the
    // typings honest without a cast on every access.
    if (!('fov' in camera)) return

    const aspect = size.width / Math.max(1, size.height)
    const framing = getCameraFraming(aspect)

    const target = new THREE.Vector3(...framing.target)
    const offset = camera.position.clone().sub(target)
    const currentDistance = offset.length()
    const wantedDistance = new THREE.Vector3(...framing.position).sub(target).length()

    if (currentDistance > 0.001) {
      camera.position.copy(target).add(offset.multiplyScalar(wantedDistance / currentDistance))
    } else {
      camera.position.set(...framing.position)
    }

    camera.fov = framing.fov
    camera.updateProjectionMatrix()
  }, [camera, size.width, size.height])

  return null
}
