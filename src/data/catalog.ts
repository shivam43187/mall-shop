import { create } from 'zustand'
import { PRODUCTS, type ModelKind, type Product } from './products'
import { STORES, type StoreId } from './stores'

export const MODEL_KINDS: ModelKind[] = [
  'tshirt', 'jeans', 'dress', 'shoe', 'phone', 'tablet', 'laptop', 'headphones', 'watch', 'speaker',
  'lamp', 'mug', 'cushion', 'vase', 'candle', 'clock', 'book', 'ball', 'dumbbell', 'bottle', 'racket',
  'perfume', 'lipstick', 'jar', 'teddy', 'car', 'blocks', 'apple', 'carton', 'bread',
]

/** A row of the Supabase `products` table. */
export interface ProductRow {
  id: string
  store_id: string
  name: string
  price: number
  description: string
  kind: string
  colours: unknown
  sizes: unknown
  active?: boolean
}

const HEX = /^#[0-9a-fA-F]{6}$/

/** Turns a database row into a Product, or null if the row is malformed (so one bad row can't break the mall). */
export function productFromRow(r: ProductRow): Product | null {
  if (!STORES.some((s) => s.id === r.store_id)) return null
  if (!MODEL_KINDS.includes(r.kind as ModelKind)) return null
  if (!Number.isInteger(r.price) || r.price < 1) return null
  const colours = Array.isArray(r.colours)
    ? r.colours.filter((c): c is { name: string; hex: string } => typeof c?.name === 'string' && c.name.length > 0 && HEX.test(c?.hex))
    : []
  if (colours.length === 0) return null
  const sizes = Array.isArray(r.sizes) ? r.sizes.filter((s): s is string => typeof s === 'string' && s.length > 0) : []
  return {
    id: r.id,
    storeId: r.store_id as StoreId,
    name: r.name,
    price: r.price,
    description: r.description ?? '',
    kind: r.kind as ModelKind,
    colours: colours.map((c) => ({ name: c.name, hex: c.hex })),
    ...(sizes.length ? { sizes } : {}),
  }
}

/** Built-in products plus any added from the admin page. */
export function mergeCatalog(extra: Product[]) {
  const builtIn = new Set(PRODUCTS.map((p) => p.id))
  const products = [...PRODUCTS, ...extra.filter((p) => !builtIn.has(p.id))]
  return { products, byId: new Map(products.map((p) => [p.id, p])) }
}

interface CatalogState {
  products: Product[]
  byId: Map<string, Product>
  /** True once loading has finished, whether or not it succeeded. */
  ready: boolean
  /** True only if the full catalog is known (database loaded, or there is no database). Safe to prune carts. */
  complete: boolean
  setExtra: (extra: Product[]) => void
  setReady: (complete: boolean) => void
}

/** How many products fit in one store's shelves (two rows of eight). */
export const MAX_PER_STORE = 16

export const useCatalog = create<CatalogState>((set) => ({
  ...mergeCatalog([]),
  ready: false,
  complete: false,
  setExtra: (extra) => set({ ...mergeCatalog(extra), ready: true, complete: true }),
  setReady: (complete) => set({ ready: true, complete }),
}))

export const productOf = (id: string) => useCatalog.getState().byId.get(id)
