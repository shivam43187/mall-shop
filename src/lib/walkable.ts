import { CAFE, LAYOUTS, type FloorRect } from '../data/layout'
import { MALL, STORES, storeFrontX, type Store } from '../data/stores'

interface Rect {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
  store?: Store
}

/** Keeps the camera this far from walls. */
const R = 0.4

const { hallHalfWidth: HW, hallHalfLength: HL, storeDepth: D, storeWidth: W, doorHalfWidth: DW } = MALL

const rects: Rect[] = [{ minX: -HW + R, maxX: HW - R, minZ: -HL + R, maxZ: HL - R }]

for (const store of STORES) {
  const { x, dir } = storeFrontX(store)
  const inner = x + dir * D
  // Store interior
  rects.push({
    minX: Math.min(x, inner) + R,
    maxX: Math.max(x, inner) - R,
    minZ: store.z - W / 2 + R,
    maxZ: store.z + W / 2 - R,
    store,
  })
  // Doorway joining the hallway and the store
  rects.push({ minX: x - 1, maxX: x + 1, minZ: store.z - DW + R, maxZ: store.z + DW - R })
}

const inside = (r: Rect, x: number, z: number) => x >= r.minX && x <= r.maxX && z >= r.minZ && z <= r.maxZ

/** Planter positions [x, z]; shared with the scene so collisions match what you see. */
export const PLANTERS: [number, number][] = [
  [-4, -26], [4, -26], [-4, -14], [4, -14], [-4, 14], [4, 14], [-4, 26], [4, 26],
]

/** Round obstacles: [x, z, radius]. */
const obstacles: [number, number, number][] = [
  [0, 0, 2.4 + R], // fountain
  ...PLANTERS.map(([x, z]): [number, number, number] => [x, z, 0.6 + R]),
  ...CAFE.tables.map(([x, z]): [number, number, number] => [x, z, CAFE.tableRadius + R]),
  ...[...LAYOUTS.values()].flatMap((l) => l.roundSolids.map(([x, z, r]): [number, number, number] => [x, z, r + R])),
]

const grow = (b: FloorRect): FloorRect => ({ minX: b.minX - R, maxX: b.maxX + R, minZ: b.minZ - R, maxZ: b.maxZ + R })
const { kiosk } = CAFE

/** Store fixtures, benches and the café kiosk, padded so the camera doesn't clip into them. */
const solids: FloorRect[] = [
  ...[...LAYOUTS.values()].flatMap((l) => l.solids),
  ...[5, -5, 16, -16].map((z) => ({ minX: -1, maxX: 1, minZ: z - 0.3, maxZ: z + 0.3 })), // benches
  { minX: kiosk.x - kiosk.sx / 2, maxX: kiosk.x + kiosk.sx / 2, minZ: kiosk.z - kiosk.sz / 2, maxZ: kiosk.z + kiosk.sz / 2 },
].map(grow)

export function isWalkable(x: number, z: number) {
  if (obstacles.some(([ox, oz, r]) => Math.hypot(x - ox, z - oz) < r)) return false
  if (solids.some((b) => inside(b, x, z))) return false
  return rects.some((r) => inside(r, x, z))
}

/** The store the point is inside, if any. */
export function storeAt(x: number, z: number): Store | undefined {
  return rects.find((r) => r.store && inside(r, x, z))?.store
}

/** The store whose door is within `range` metres of the point. */
export function storeNear(x: number, z: number, range = 4): Store | undefined {
  return STORES.find((s) => {
    const { x: fx } = storeFrontX(s)
    return Math.hypot(fx - x, s.z - z) < range
  })
}
