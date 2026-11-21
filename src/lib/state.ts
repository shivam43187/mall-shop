import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '../data/products'
import type { StoreId } from '../data/stores'
import { lineMatchesCatalog } from './cartRules'
import { MAX_QTY } from './limits'

export type Overlay =
  | null
  | { type: 'product'; id: string }
  | { type: 'cart' }
  | { type: 'order'; sessionId: string }
  | { type: 'account' }
  | { type: 'admin' }

interface UIState {
  overlay: Overlay
  /** Product under the crosshair (desktop) — shows a hint. */
  aimedId: string | null
  /** The exact shelf/table slot aimed at, so only that copy is highlighted. */
  aimedSlot: number | null
  locked: boolean
  started: boolean
  toast: string | null
  /** The shopkeeper currently greeting you, with a counter so re-entering a store greets again. */
  greeting: { storeId: StoreId; n: number } | null
  greet: (storeId: StoreId) => void
  /** Hides the greeting when you walk out of that store. */
  leave: (storeId: StoreId) => void
  open: (o: Overlay) => void
  close: () => void
  setAimed: (aim: { slot: number; productId: string } | null) => void
  setLocked: (v: boolean) => void
  setStarted: (v: boolean) => void
  showToast: (msg: string) => void
}

let toastTimer: ReturnType<typeof setTimeout> | undefined
let greetTimer: ReturnType<typeof setTimeout> | undefined
/** How long a shopkeeper's greeting stays on screen. */
const GREETING_MS = 9000

export const useUI = create<UIState>((set) => ({
  overlay: null,
  aimedId: null,
  aimedSlot: null,
  locked: false,
  started: false,
  toast: null,
  greeting: null,
  greet: (storeId) => {
    clearTimeout(greetTimer)
    set((s) => ({ greeting: { storeId, n: (s.greeting?.n ?? 0) + 1 } }))
    greetTimer = setTimeout(() => set({ greeting: null }), GREETING_MS)
  },
  leave: (storeId) => set((s) => (s.greeting?.storeId === storeId ? { greeting: null } : s)),
  open: (overlay) => set({ overlay }),
  close: () => set({ overlay: null }),
  setAimed: (aim) =>
    set((s) => (s.aimedSlot === (aim?.slot ?? null) ? s : { aimedSlot: aim?.slot ?? null, aimedId: aim?.productId ?? null })),
  setLocked: (locked) => set({ locked }),
  setStarted: (started) => set({ started }),
  showToast: (toast) => {
    clearTimeout(toastTimer)
    set({ toast })
    toastTimer = setTimeout(() => set({ toast: null }), 2200)
  },
}))

export interface CartItem {
  /** productId + chosen options, so the same tee in two sizes is two lines. */
  key: string
  productId: string
  colour: string
  size?: string
  qty: number
}

interface CartState {
  items: CartItem[]
  /** Returns how many were actually added (lines are capped at MAX_QTY). */
  add: (productId: string, colour: string, size: string | undefined, qty: number) => number
  setQty: (key: string, qty: number) => void
  remove: (key: string) => void
  clear: () => void
  /** Drops lines that no longer match the catalog (run once the catalog has loaded). */
  prune: (byId: Map<string, Product>) => void
}



export { MAX_QTY }

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (productId, colour, size, qty) => {
        const key = [productId, colour, size ?? ''].join('|')
        const existing = get().items.find((i) => i.key === key)
        const before = existing?.qty ?? 0
        const after = Math.min(MAX_QTY, before + qty)
        if (after === before) return 0
        set((s) => ({
          items: existing
            ? s.items.map((i) => (i.key === key ? { ...i, qty: after } : i))
            : [...s.items, { key, productId, colour, size, qty: after }],
        }))
        return after - before
      },
      setQty: (key, qty) =>
        set((s) => ({
          items: qty <= 0 ? s.items.filter((i) => i.key !== key) : s.items.map((i) => (i.key === key ? { ...i, qty: Math.min(MAX_QTY, qty) } : i)),
        })),
      remove: (key) => set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
      clear: () => set({ items: [] }),
      prune: (byId) =>
        set((s) => {
          const items = s.items.filter((i) => lineMatchesCatalog(i, byId))
          return items.length === s.items.length ? s : { items }
        }),
    }),
    {
      name: 'mall-shop-cart',
      version: 1,
      // Saved carts can be stale or edited by hand. Check the shape here; prune() checks the catalog later,
      // once products added from the admin page have loaded.
      merge: (persisted, current) => {
        const saved = (persisted as Partial<CartState> | undefined)?.items
        const items = (Array.isArray(saved) ? saved : []).flatMap((i): CartItem[] => {
          if (typeof i?.productId !== 'string' || typeof i.colour !== 'string') return []
          if (i.size !== undefined && typeof i.size !== 'string') return []
          const qty = Math.floor(Number(i.qty))
          if (!(qty >= 1)) return []
          return [{ key: [i.productId, i.colour, i.size ?? ''].join('|'), productId: i.productId, colour: i.colour, size: i.size, qty: Math.min(MAX_QTY, qty) }]
        })
        return { ...current, items }
      },
    },
  ),
)

export function cartTotals(items: CartItem[], byId: Map<string, Product>) {
  let count = 0
  let subtotal = 0
  for (const i of items) {
    const p = byId.get(i.productId)
    if (!p) continue
    count += i.qty
    subtotal += p.price * i.qty
  }
  return { count, subtotal }
}
