import { useMemo } from 'react'
import { MALL, storeFrontX, type Store } from '../data/stores'
import { LAYOUTS } from '../data/layout'
import { makeSignTexture } from '../lib/signTexture'

const { storeDepth: D, storeWidth: W, doorHalfWidth: DW, wallHeight: H } = MALL
const T = 0.2 // wall thickness

/** One shop: glass front with a doorway, sign, interior room and placeholder fixtures. */
export function Storefront({ store }: { store: Store }) {
  const { x, dir } = storeFrontX(store)
  const layout = LAYOUTS.get(store.id)!
  const sign = useMemo(() => makeSignTexture(store.name, store.category, store.color), [store])
  const cx = x + (dir * D) / 2 // centre of the interior
  const paneW = W / 2 - DW // width of each glass pane beside the door
  // The sign and glass face the hallway: rotate so +z of the plane points back toward x=0.
  const faceHall = dir === -1 ? Math.PI / 2 : -Math.PI / 2

  return (
    <group>
      {/* Interior floor, tinted with the store colour */}
      <mesh rotation-x={-Math.PI / 2} position={[cx, 0.01, store.z]} receiveShadow>
        <planeGeometry args={[D, W]} />
        <meshStandardMaterial color={store.accent} />
      </mesh>
      {/* Ceiling */}
      <mesh rotation-x={Math.PI / 2} position={[cx, H, store.z]}>
        <planeGeometry args={[D, W]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Back wall in store colour */}
      <mesh position={[x + dir * D, H / 2, store.z]}>
        <boxGeometry args={[T, H, W]} />
        <meshStandardMaterial color={store.color} />
      </mesh>
      {/* Side walls */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[cx, H / 2, store.z + (s * W) / 2]}>
          <boxGeometry args={[D, H, T]} />
          <meshStandardMaterial color="#f4f1ec" />
        </mesh>
      ))}
      {/* Glass panes either side of the doorway */}
      {[-1, 1].map((s) => (
        <mesh key={`g${s}`} position={[x, 1.6, store.z + s * (DW + paneW / 2)]}>
          <boxGeometry args={[0.08, 3.2, paneW]} />
          <meshPhysicalMaterial color={store.accent} transparent opacity={0.25} roughness={0.05} metalness={0.1} />
        </mesh>
      ))}
      {/* Frame above the glass, holding the sign */}
      <mesh position={[x, 3.2 + (H - 3.2) / 2, store.z]}>
        <boxGeometry args={[0.3, H - 3.2, W]} />
        <meshStandardMaterial color="#2b2b2b" />
      </mesh>
      <mesh position={[x - dir * 0.17, 4.3, store.z]} rotation-y={faceHall}>
        <planeGeometry args={[7, 1.75]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
      {/* Door posts */}
      {[-1, 1].map((s) => (
        <mesh key={`p${s}`} position={[x, 1.6, store.z + s * DW]}>
          <boxGeometry args={[0.25, 3.2, 0.25]} />
          <meshStandardMaterial color="#2b2b2b" />
        </mesh>
      ))}
      {/* Store lighting */}
      <pointLight position={[cx, H - 1, store.z]} intensity={18} distance={14} color="#fff4e0" />

      {/* Placeholder fixtures; products arrive in step 2 */}
      {/* Wall shelves along the back */}
      {[0.6, 1.4, 2.2].map((y) => (
        <mesh key={`s${y}`} position={[x + dir * (D - 0.5), y, store.z]}>
          <boxGeometry args={[0.8, 0.08, W - 1.5]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}
      {/* Display tables */}
      {[-2.5, 2.5].map((dz) => (
        <group key={`t${dz}`} position={[x + dir * (D / 2), 0, store.z + dz]}>
          <mesh position-y={0.45} castShadow>
            <boxGeometry args={[1.4, 0.9, 2.4]} />
            <meshStandardMaterial color="#fafafa" />
          </mesh>
          <mesh position-y={0.92}>
            <boxGeometry args={[1.5, 0.04, 2.5]} />
            <meshStandardMaterial color={store.color} />
          </mesh>
        </group>
      ))}
      {/* Checkout counter */}
      <mesh position={[layout.counter.x, 0.55, layout.counter.z]} castShadow>
        <boxGeometry args={[layout.counter.sx, 1.1, layout.counter.sz]} />
        <meshStandardMaterial color={store.color} />
      </mesh>
    </group>
  )
}
