import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { CAFE, LAYOUTS } from '../data/layout'
import { STORES, type Store } from '../data/stores'
import { makeSignTexture } from '../lib/signTexture'
import { Character } from './Character'

function Mannequin({ x, z, yaw, top }: { x: number; z: number; yaw: number; top: string }) {
  return (
    <group position={[x, 0, z]} rotation-y={yaw} userData={{ noPick: true }}>
      <mesh position-y={0.04}>
        <cylinderGeometry args={[0.3, 0.3, 0.08, 20]} />
        <meshStandardMaterial color="#9e9e9e" metalness={0.6} roughness={0.3} />
      </mesh>
      <group position-y={0.08}>
        <Character look={{ skin: '#f2f2f2', hair: '#f2f2f2', top, bottom: '#f2f2f2', mannequin: true }} />
      </group>
      {/* Outfit on the mannequin */}
      <mesh position-y={1.23}>
        <capsuleGeometry args={[0.215, 0.38, 4, 12]} />
        <meshStandardMaterial color={top} />
      </mesh>
    </group>
  )
}

function FruitCrate({ x, z, yaw, fruit }: { x: number; z: number; yaw: number; fruit: string }) {
  const fruits = useMemo(
    () => Array.from({ length: 12 }, (_, i) => [((i % 4) - 1.5) * 0.17, Math.floor(i / 4) * 0.17 - 0.17] as const),
    [],
  )
  return (
    <group position={[x, 0, z]} rotation-y={yaw} userData={{ noPick: true }}>
      <mesh position-y={0.35} castShadow>
        <boxGeometry args={[0.8, 0.7, 0.6]} />
        <meshStandardMaterial color="#a1887f" />
      </mesh>
      {fruits.map(([fx, fz], i) => (
        <mesh key={i} position={[fx, 0.76, fz]}>
          <sphereGeometry args={[0.08, 12, 10]} />
          <meshStandardMaterial color={fruit} />
        </mesh>
      ))}
    </group>
  )
}

function Plant({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]} userData={{ noPick: true }}>
      <mesh position-y={0.25}>
        <cylinderGeometry args={[0.3, 0.24, 0.5, 16]} />
        <meshStandardMaterial color="#eeeeee" />
      </mesh>
      <mesh position-y={0.95}>
        <icosahedronGeometry args={[0.5, 1]} />
        <meshStandardMaterial color="#388e3c" flatShading />
      </mesh>
    </group>
  )
}

/** A wall of TVs whose screens slowly cycle through colours. */
function TvWall({ x, z, faceZ }: { x: number; z: number; faceZ: number }) {
  const mats = useRef<THREE.MeshBasicMaterial[]>([])
  useFrame((state) => {
    const t = state.clock.elapsedTime
    mats.current.forEach((m, i) => m.color.setHSL((t * 0.05 + i * 0.13) % 1, 0.6, 0.45 + 0.08 * Math.sin(t * 1.5 + i)))
  })
  const screens: [number, number][] = []
  for (let row = 0; row < 2; row++) for (let col = -1; col <= 1; col++) screens.push([col * 1.6, 1.8 + row * 1.05])
  return (
    <group position={[x, 0, z]} rotation-y={faceZ === 1 ? 0 : Math.PI}>
      {screens.map(([sx, sy], i) => (
        <group key={i} position={[sx, sy, 0.05]}>
          <mesh>
            <boxGeometry args={[1.45, 0.88, 0.06]} />
            <meshStandardMaterial color="#111" />
          </mesh>
          <mesh position-z={0.035}>
            <planeGeometry args={[1.36, 0.78]} />
            <meshBasicMaterial ref={(m) => void (m && (mats.current[i] = m))} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function StoreDecor({ store }: { store: Store }) {
  const l = LAYOUTS.get(store.id)!
  const yaw = l.dir === -1 ? Math.PI / 2 : -Math.PI / 2 // face the hallway
  const [a, b] = l.decor
  switch (store.id) {
    case 'fashion':
      return (
        <>
          <Mannequin x={a.x} z={a.z} yaw={yaw} top="#ff7043" />
          <Mannequin x={b.x} z={b.z} yaw={yaw} top="#3949ab" />
        </>
      )
    case 'grocery':
      return (
        <>
          <FruitCrate x={a.x} z={a.z} yaw={yaw} fruit="#d32f2f" />
          <FruitCrate x={b.x} z={b.z} yaw={yaw} fruit="#fb8c00" />
        </>
      )
    case 'electronics':
      return (
        <>
          <TvWall x={l.feature.x} z={l.feature.z} faceZ={l.feature.faceZ} />
          <Plant x={a.x} z={a.z} />
        </>
      )
    default:
      return <Plant x={a.x} z={a.z} />
  }
}

function Umbrella({ colour }: { colour: string }) {
  return (
    <>
      <mesh position-y={1.2}>
        <cylinderGeometry args={[0.03, 0.03, 2.4, 8]} />
        <meshStandardMaterial color="#757575" />
      </mesh>
      <mesh position-y={2.35}>
        <coneGeometry args={[1.25, 0.45, 8, 1, true]} />
        <meshStandardMaterial color={colour} side={THREE.DoubleSide} />
      </mesh>
    </>
  )
}

function CafeTable({ x, z, colour }: { x: number; z: number; colour: string }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position-y={0.74} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.04, 24]} />
        <meshStandardMaterial color="#fafafa" />
      </mesh>
      <mesh position-y={0.37}>
        <cylinderGeometry args={[0.05, 0.25, 0.74, 12]} />
        <meshStandardMaterial color="#424242" />
      </mesh>
      {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((a) => (
        <group key={a} position={[Math.sin(a) * 0.8, 0, Math.cos(a) * 0.8]} rotation-y={a}>
          <mesh position-y={0.45}>
            <boxGeometry args={[0.4, 0.05, 0.4]} />
            <meshStandardMaterial color="#8d6e63" />
          </mesh>
          <mesh position={[0, 0.7, 0.18]}>
            <boxGeometry args={[0.4, 0.45, 0.04]} />
            <meshStandardMaterial color="#8d6e63" />
          </mesh>
          {[-0.17, 0.17].flatMap((lx) =>
            [-0.17, 0.17].map((lz) => (
              <mesh key={`${lx}${lz}`} position={[lx, 0.22, lz]}>
                <boxGeometry args={[0.03, 0.45, 0.03]} />
                <meshStandardMaterial color="#424242" />
              </mesh>
            )),
          )}
        </group>
      ))}
      {/* Coffee cup */}
      <mesh position={[0.15, 0.81, 0.05]}>
        <cylinderGeometry args={[0.04, 0.03, 0.09, 12]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      <Umbrella colour={colour} />
    </group>
  )
}

function Cafe() {
  const sign = useMemo(() => makeSignTexture('Mall Café', 'Coffee · Chai · Snacks', '#5d4037'), [])
  const { kiosk } = CAFE
  return (
    <group>
      <mesh position={[kiosk.x, 0.55, kiosk.z]} castShadow>
        <boxGeometry args={[kiosk.sx, 1.1, kiosk.sz]} />
        <meshStandardMaterial color="#6d4c41" />
      </mesh>
      <mesh position={[kiosk.x, 1.12, kiosk.z]}>
        <boxGeometry args={[kiosk.sx + 0.1, 0.05, kiosk.sz + 0.1]} />
        <meshStandardMaterial color="#d7ccc8" />
      </mesh>
      {/* Coffee machine */}
      <mesh position={[kiosk.x + 1.2, 1.4, kiosk.z - 0.2]}>
        <boxGeometry args={[0.5, 0.5, 0.4]} />
        <meshStandardMaterial color="#9e9e9e" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 3.3, -29.84]}>
        <planeGeometry args={[5, 1.25]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
      {/* Barista behind the kiosk, facing the hallway */}
      <group position={[kiosk.x - 0.6, 0, -29.45]}>
        <Character look={{ skin: '#c68642', hair: '#1a1a1a', top: '#fafafa', bottom: '#3e2723', apron: '#5d4037' }} />
      </group>
      {CAFE.tables.map(([x, z], i) => (
        <CafeTable key={i} x={x} z={z} colour={['#e53935', '#fdd835', '#43a047'][i % 3]} />
      ))}
    </group>
  )
}

export function Decor() {
  return (
    <>
      {STORES.map((s) => (
        <StoreDecor key={s.id} store={s} />
      ))}
      <Cafe />
    </>
  )
}
