import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { LAYOUTS } from '../data/layout'
import { STORES } from '../data/stores'
import { player } from '../lib/input'
import { Character, type CharacterAnim, type Look } from './Character'

/** Walking lanes down each side of the hallway, clear of the fountain, benches, planters and café. */
const LANE_X = 5.4
/** Where shoppers cross the hallway (gaps between benches and the fountain). */
const CROSSINGS = [-11, 10, 21]
const SPEED = 1.25
const COUNT = 10

type Point = { x: number; z: number; wait?: number }

const SKINS = ['#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#ffdbac', '#a0704f']
const HAIR = ['#1a1a1a', '#3b2314', '#6b4423', '#b8860b', '#4a4a4a']
const TOPS = ['#e53935', '#1e88e5', '#43a047', '#fdd835', '#8e24aa', '#fb8c00', '#00897b', '#6d4c41', '#ec407a', '#546e7a']
const BOTTOMS = ['#263238', '#3949ab', '#5d4037', '#455a64', '#212121']

/** Small seeded random so shoppers look the same on every visit. */
function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const pick = <T,>(r: () => number, list: T[]) => list[Math.floor(r() * list.length)]

/** Plans the next leg of a shopper's walk: visit a store on this side, or cross to the other lane. */
function nextLeg(r: () => number, from: Point): Point[] {
  const side = from.x < 0 ? -1 : 1
  const lane = side * LANE_X
  if (r() < 0.6) {
    const stores = STORES.filter((s) => (s.side === 'left' ? -1 : 1) === side)
    const store = pick(r, stores)
    const l = LAYOUTS.get(store.id)!.browse
    // Nudge each visit along the shelf so two shoppers rarely stand in the same spot.
    const base = pick(r, l.shelfSpots)
    const spot = { x: base.x, z: base.z + (r() - 0.5) * 1.6 }
    return [
      { x: lane, z: store.z },
      { x: l.door.x, z: l.door.z },
      { x: l.aisle.x, z: l.aisle.z },
      { ...spot, wait: 2 + r() * 4 },
      { x: l.aisle.x, z: l.aisle.z },
      { x: l.door.x, z: l.door.z },
      { x: lane, z: store.z, wait: r() * 1.5 },
    ]
  }
  const z = pick(r, CROSSINGS)
  return [
    { x: lane, z },
    { x: -lane, z, wait: r() * 2 },
  ]
}

function Shopper({ seed }: { seed: number }) {
  const r = useMemo(() => rng(seed * 7919 + 13), [seed])
  const look = useMemo<Look>(
    () => ({ skin: pick(r, SKINS), hair: pick(r, HAIR), top: pick(r, TOPS), bottom: pick(r, BOTTOMS), height: 1.55 + r() * 0.3 }),
    [r],
  )
  const start = useMemo<Point>(() => ({ x: (seed % 2 ? 1 : -1) * LANE_X, z: -20 + r() * 40 }), [seed, r])
  const group = useRef<THREE.Group>(null)
  const anim = useRef<CharacterAnim>({ walk: 0, wave: 0 })
  const route = useRef<Point[]>([])
  const pos = useRef({ ...start })
  const waitLeft = useRef(r() * 3)

  useFrame((_, dt) => {
    dt = Math.min(dt, 0.05)
    const g = group.current
    if (!g) return
    if (waitLeft.current > 0) {
      waitLeft.current -= dt
      anim.current.walk = Math.max(0, anim.current.walk - dt * 4)
      return
    }
    // Politely stop when about to walk into you.
    if (Math.hypot(player.x - pos.current.x, player.z - pos.current.z) < 1) {
      anim.current.walk = Math.max(0, anim.current.walk - dt * 4)
      return
    }
    if (route.current.length === 0) route.current = nextLeg(r, pos.current)
    const target = route.current[0]
    const dx = target.x - pos.current.x
    const dz = target.z - pos.current.z
    const dist = Math.hypot(dx, dz)
    const step = SPEED * dt
    if (dist <= step) {
      pos.current = { x: target.x, z: target.z }
      route.current.shift()
      waitLeft.current = target.wait ?? 0
    } else {
      pos.current.x += (dx / dist) * step
      pos.current.z += (dz / dist) * step
      // Turn smoothly toward where they're walking.
      const yaw = Math.atan2(dx, dz)
      let diff = yaw - g.rotation.y
      diff = Math.atan2(Math.sin(diff), Math.cos(diff))
      g.rotation.y += diff * Math.min(1, dt * 8)
    }
    anim.current.walk = Math.min(1, anim.current.walk + dt * 4)
    g.position.set(pos.current.x, 0, pos.current.z)
  })

  return (
    <group ref={group} position={[start.x, 0, start.z]}>
      <Character look={look} anim={anim} />
    </group>
  )
}

/** A handful of other shoppers wandering the hallway and popping into stores. */
export function Shoppers() {
  return (
    <>
      {Array.from({ length: COUNT }, (_, i) => (
        <Shopper key={i} seed={i + 1} />
      ))}
    </>
  )
}
