import { PointerLockControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, type ComponentRef } from 'react'
import * as THREE from 'three'
import { controls, input, isTouch, picker, player } from '../lib/input'
import { audio } from '../lib/audio'
import { useUI } from '../lib/state'
import { isWalkable } from '../lib/walkable'

const EYE = 1.65
const WALK = 4.5
const RUN = 8
const LOOK_SPEED = 0.004

/**
 * First-person camera. Desktop: click to lock the mouse, WASD/arrows to move, Shift to run.
 * Touch: left joystick to move, drag anywhere else to look.
 */
export function Player() {
  const { camera } = useThree()
  const lockRef = useRef<ComponentRef<typeof PointerLockControls>>(null)
  const setLocked = useUI((s) => s.setLocked)

  useEffect(() => {
    controls.lock = () => lockRef.current?.lock()
    controls.unlock = () => lockRef.current?.unlock()
  }, [])
  const euler = useRef(new THREE.Euler(0, player.yaw, 0, 'YXZ'))
  const fwd = useRef(new THREE.Vector3())
  const right = useRef(new THREE.Vector3())

  useEffect(() => {
    camera.position.set(player.x, EYE, player.z)
    camera.rotation.copy(euler.current)
    if (import.meta.env.DEV) Object.assign(window, { __camera: camera, __picker: picker, __ui: useUI })
    const down = (e: KeyboardEvent) => {
      const ui = useUI.getState()
      if (e.code === 'Escape' && ui.overlay) {
        ui.close()
        return
      }
      if (ui.overlay) return
      // Shortcuts so menus are reachable while the mouse is captured for walking.
      if (e.code === 'KeyM' && !e.repeat && !e.metaKey && !e.ctrlKey && !e.altKey) return audio.setMuted(!audio.muted)
      const shortcut = e.code === 'KeyC' ? 'cart' : e.code === 'KeyU' ? 'account' : null
      if (shortcut && ui.started) {
        input.keys.clear()
        ui.open({ type: shortcut })
        controls.unlock()
        return
      }
      input.keys.add(e.code)
    }
    const up = (e: KeyboardEvent) => input.keys.delete(e.code)
    const clear = () => input.keys.clear()
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', clear)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', clear)
    }
  }, [camera])

  useFrame((_, dt) => {
    dt = Math.min(dt, 0.05)

    // Touch look
    if (input.lookDX || input.lookDY) {
      const e = euler.current.setFromQuaternion(camera.quaternion, 'YXZ')
      e.y -= input.lookDX * LOOK_SPEED
      e.x = THREE.MathUtils.clamp(e.x - input.lookDY * LOOK_SPEED, -1.2, 1.2)
      camera.quaternion.setFromEuler(e)
      input.lookDX = input.lookDY = 0
    }

    if (useUI.getState().overlay) {
      input.keys.clear()
      player.speed = 0
      audio.update(dt)
      return
    }

    const k = input.keys
    let mz = input.joyY
    let mx = input.joyX
    if (k.has('KeyW') || k.has('ArrowUp')) mz += 1
    if (k.has('KeyS') || k.has('ArrowDown')) mz -= 1
    if (k.has('KeyD') || k.has('ArrowRight')) mx += 1
    if (k.has('KeyA') || k.has('ArrowLeft')) mx -= 1
    const len = Math.hypot(mx, mz)
    if (len > 1) {
      mx /= len
      mz /= len
    }

    const before = { x: camera.position.x, z: camera.position.z }
    if (mx || mz) {
      const speed = k.has('ShiftLeft') || k.has('ShiftRight') ? RUN : WALK
      camera.getWorldDirection(fwd.current)
      fwd.current.y = 0
      fwd.current.normalize()
      right.current.crossVectors(fwd.current, camera.up).normalize()
      const dx = (fwd.current.x * mz + right.current.x * mx) * speed * dt
      const dz = (fwd.current.z * mz + right.current.z * mx) * speed * dt
      const p = camera.position
      // Move each axis separately so you slide along walls instead of sticking.
      if (isWalkable(p.x + dx, p.z)) p.x += dx
      if (isWalkable(p.x, p.z + dz)) p.z += dz
    }

    camera.position.y = EYE
    player.speed = dt > 0 ? Math.hypot(camera.position.x - before.x, camera.position.z - before.z) / dt : 0
    audio.update(dt)
    player.x = camera.position.x
    player.z = camera.position.z
    player.yaw = euler.current.setFromQuaternion(camera.quaternion, 'YXZ').y
  })

  if (isTouch) return null
  // The selector matches nothing, so the mouse is only captured when UI code calls controls.lock().
  return <PointerLockControls ref={lockRef} selector="#manual-lock-only" onLock={() => setLocked(true)} onUnlock={() => setLocked(false)} />
}
