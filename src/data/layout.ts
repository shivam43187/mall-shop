import { MALL, STORES, storeFrontX, type Store } from './stores'

const { storeDepth: D, storeWidth: W } = MALL

/** An axis-aligned box on the floor, in world coordinates. */
export interface FloorRect {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

const rectAt = (cx: number, cz: number, sx: number, sz: number): FloorRect => ({
  minX: cx - sx / 2,
  maxX: cx + sx / 2,
  minZ: cz - sz / 2,
  maxZ: cz + sz / 2,
})

/**
 * Where everything inside a store sits. `depth` is metres in from the shopfront.
 * Shared by the scene (what you see), collisions (where you can walk) and the shoppers (where they go).
 */
export function storeLayout(store: Store) {
  const { x, dir } = storeFrontX(store)
  const at = (depth: number) => x + dir * depth
  /** +1 or -1: the side wall the checkout counter is on. */
  const counterSide = dir === -1 ? 1 : -1
  const counter = { x: at(2.2), z: store.z + counterSide * (W / 2 - 1.2), sx: 2.6, sz: 0.9 }
  const tables = [-2.5, 2.5].map((dz) => ({ x: at(D / 2), z: store.z + dz, sx: 1.5, sz: 2.5 }))
  const shelf = { x: at(D - 0.5), z: store.z, sx: 0.8, sz: W - 1.5 }
  /** Spots for decorations, on the side away from the counter, near the windows. Fashion and grocery use both. */
  const decor = [
    { x: at(1.1), z: store.z - counterSide * 4.6 },
    { x: at(2.6), z: store.z - counterSide * 4.6 },
  ].slice(0, store.id === 'fashion' || store.id === 'grocery' ? 2 : 1)
  return {
    x,
    dir,
    at,
    counterSide,
    counter,
    tables,
    shelf,
    /** Shopkeeper stands behind the counter, between it and the side wall. */
    keeper: { x: at(2.2), z: counter.z + counterSide * 0.85 },
    decor,
    /** Side wall away from the counter (for wall displays). */
    feature: { x: at(D / 2), z: store.z - counterSide * (W / 2 - 0.12), faceZ: counterSide },
    /** Path a shopper follows in and out: doorway → centre aisle → in front of the shelves. */
    browse: {
      door: { x: at(1.8), z: store.z },
      aisle: { x: at(7.2), z: store.z },
      shelfSpots: [-3.6, 3.6].map((dz) => ({ x: at(D - 1.6), z: store.z + dz })),
    },
    /** Fixtures you can't walk through. */
    solids: [
      rectAt(counter.x, counter.z, counter.sx, counter.sz),
      // Behind the counter belongs to the shopkeeper.
      rectAt(counter.x, counter.z + counterSide * 0.85, counter.sx, 0.8),
      ...tables.map((t) => rectAt(t.x, t.z, t.sx, t.sz)),
      rectAt(shelf.x, shelf.z, shelf.sx, shelf.sz),
    ],
    /** Round decorations you can't walk through: [x, z, radius]. */
    roundSolids: decor.map((d): [number, number, number] => [d.x, d.z, 0.45]),
  }
}

export const LAYOUTS = new Map(STORES.map((s) => [s.id, storeLayout(s)]))

/** Café at the south end of the hallway. */
export const CAFE = {
  kiosk: { x: 0, z: -28.3, sx: 4, sz: 1.2 },
  tables: [
    [-2.2, -23.5],
    [2.2, -23.5],
    [0, -21],
  ] as [number, number][],
  tableRadius: 0.95,
}
