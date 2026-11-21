export type Side = 'left' | 'right'

export interface Store {
  id: string
  name: string
  category: string
  color: string
  accent: string
  side: Side
  /** Centre of the store along the hallway (z axis). */
  z: number
}

/** Mall layout constants, in metres. */
export const MALL = {
  hallHalfWidth: 7,
  hallHalfLength: 30,
  storeDepth: 10,
  storeWidth: 12,
  doorHalfWidth: 2,
  wallHeight: 6,
} as const

export const STORES: Store[] = [
  { id: 'fashion', name: 'Thread & Co', category: 'Fashion', color: '#c2185b', accent: '#f8bbd0', side: 'left', z: -21 },
  { id: 'electronics', name: 'Volt', category: 'Electronics', color: '#1565c0', accent: '#bbdefb', side: 'left', z: -7 },
  { id: 'home', name: 'Nest Home', category: 'Home & Living', color: '#6d4c41', accent: '#d7ccc8', side: 'left', z: 7 },
  { id: 'books', name: 'Paper Lane', category: 'Books', color: '#2e7d32', accent: '#c8e6c9', side: 'left', z: 21 },
  { id: 'sports', name: 'Peak Sports', category: 'Sports', color: '#ef6c00', accent: '#ffe0b2', side: 'right', z: -21 },
  { id: 'beauty', name: 'Glow', category: 'Beauty', color: '#8e24aa', accent: '#e1bee7', side: 'right', z: -7 },
  { id: 'toys', name: 'Playbox', category: 'Toys', color: '#f9a825', accent: '#fff9c4', side: 'right', z: 7 },
  { id: 'grocery', name: 'Fresh Market', category: 'Grocery', color: '#00897b', accent: '#b2dfdb', side: 'right', z: 21 },
]

/** x of the store's shopfront wall, and the direction into the store. */
export function storeFrontX(store: Store) {
  const dir = store.side === 'left' ? -1 : 1
  return { x: dir * MALL.hallHalfWidth, dir }
}
