import { useMemo } from 'react'
import * as THREE from 'three'
import { MALL, STORES } from '../data/stores'
import { makeFloorTexture } from '../lib/signTexture'
import { PLANTERS } from '../lib/walkable'
import { Storefront } from './Storefront'

const { hallHalfWidth: HW, hallHalfLength: HL, wallHeight: H, storeWidth: W } = MALL
const LEN = HL * 2

function Floor() {
  const tex = useMemo(() => {
    const t = makeFloorTexture()
    t.repeat.set(HW, HL)
    return t
  }, [])
  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[HW * 2, LEN]} />
      <meshStandardMaterial map={tex} roughness={0.35} />
    </mesh>
  )
}

/** Wall pieces on the hallway sides between and around the shopfronts. */
function HallWalls() {
  const pieces: { x: number; z: number; len: number }[] = []
  for (const side of [-1, 1]) {
    const zs = STORES.filter((s) => (side === -1 ? s.side === 'left' : s.side === 'right'))
      .map((s) => s.z)
      .sort((a, b) => a - b)
    let cursor = -HL
    for (const z of zs) {
      const start = z - W / 2
      if (start > cursor) pieces.push({ x: side * HW, z: (cursor + start) / 2, len: start - cursor })
      cursor = z + W / 2
    }
    if (cursor < HL) pieces.push({ x: side * HW, z: (cursor + HL) / 2, len: HL - cursor })
  }
  return (
    <>
      {pieces.map((p, i) => (
        <mesh key={i} position={[p.x, H / 2, p.z]}>
          <boxGeometry args={[0.3, H, p.len]} />
          <meshStandardMaterial color="#efe9e1" />
        </mesh>
      ))}
      {/* End walls */}
      {[-1, 1].map((s) => (
        <mesh key={`e${s}`} position={[0, H / 2, s * HL]}>
          <boxGeometry args={[HW * 2, H, 0.3]} />
          <meshStandardMaterial color="#e3dbcf" />
        </mesh>
      ))}
    </>
  )
}

/** Ceiling with a long glass skylight down the middle. */
function Ceiling() {
  const side = (HW * 2 - 4) / 2
  return (
    <>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (2 + side / 2), H, 0]} rotation-x={Math.PI / 2}>
          <planeGeometry args={[side, LEN]} />
          <meshStandardMaterial color="#ffffff" side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh position={[0, H + 0.01, 0]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[4, LEN]} />
        <meshBasicMaterial color="#cfe8ff" side={THREE.DoubleSide} />
      </mesh>
      {/* Skylight beams */}
      {Array.from({ length: 13 }, (_, i) => -HL + 5 * i).map((z) => (
        <mesh key={z} position={[0, H - 0.1, z]}>
          <boxGeometry args={[4, 0.2, 0.2]} />
          <meshStandardMaterial color="#9e9e9e" />
        </mesh>
      ))}
    </>
  )
}

function Bench({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation-y={rotation}>
      <mesh position-y={0.45} castShadow>
        <boxGeometry args={[2, 0.1, 0.6]} />
        <meshStandardMaterial color="#8d6e63" />
      </mesh>
      {[-0.8, 0.8].map((x) => (
        <mesh key={x} position={[x, 0.22, 0]}>
          <boxGeometry args={[0.1, 0.45, 0.5]} />
          <meshStandardMaterial color="#424242" />
        </mesh>
      ))}
    </group>
  )
}

function Planter({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position-y={0.4} castShadow>
        <cylinderGeometry args={[0.6, 0.5, 0.8, 20]} />
        <meshStandardMaterial color="#5d5d5d" />
      </mesh>
      <mesh position-y={1.4} castShadow>
        <icosahedronGeometry args={[0.8, 1]} />
        <meshStandardMaterial color="#43a047" flatShading />
      </mesh>
    </group>
  )
}

/** Fountain in the central atrium. */
function Fountain() {
  return (
    <group position={[0, 0, 0]}>
      <mesh position-y={0.3} receiveShadow castShadow>
        <cylinderGeometry args={[2.2, 2.4, 0.6, 40]} />
        <meshStandardMaterial color="#bdbdbd" />
      </mesh>
      <mesh position-y={0.58} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[2, 40]} />
        <meshStandardMaterial color="#4fc3f7" roughness={0.05} metalness={0.2} />
      </mesh>
      <mesh position-y={1.2}>
        <cylinderGeometry args={[0.2, 0.3, 1.4, 16]} />
        <meshStandardMaterial color="#9e9e9e" />
      </mesh>
      <mesh position-y={1.95}>
        <sphereGeometry args={[0.35, 20, 20]} />
        <meshStandardMaterial color="#81d4fa" emissive="#29b6f6" emissiveIntensity={0.4} />
      </mesh>
    </group>
  )
}

export function Mall() {
  return (
    <>
      <color attach="background" args={['#cfe8ff']} />
      <fog attach="fog" args={['#e9eef3', 25, 70]} />
      <hemisphereLight args={['#ffffff', '#d7cfc4', 1.4]} />
      <directionalLight position={[3, 12, 4]} intensity={1.4} castShadow shadow-mapSize={[2048, 2048]}>
        <orthographicCamera attach="shadow-camera" args={[-10, 10, 32, -32, 1, 30]} />
      </directionalLight>

      <Floor />
      <HallWalls />
      <Ceiling />
      {STORES.map((s) => (
        <Storefront key={s.id} store={s} />
      ))}

      <Fountain />
      <Bench position={[0, 0, 5]} />
      <Bench position={[0, 0, -5]} rotation={Math.PI} />
      <Bench position={[0, 0, 16]} />
      <Bench position={[0, 0, -16]} rotation={Math.PI} />
      {PLANTERS.map(([x, z]) => (
        <Planter key={`${x},${z}`} position={[x, 0, z]} />
      ))}
    </>
  )
}
