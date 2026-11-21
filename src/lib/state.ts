import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { productById } from '../data/products'
import { MAX_QTY } from './limits'

export type Overlay = null | { type: 'product'; id: string } | { type: 'cart' } | { type: 'order'; sessionId: string }

interface UIState {
  overlay: Overlay
  /** Product under the crosshair (desktop) — shows a hint. */
  aimedId: string | null
  /** The exact shelf/table slot aimed at, so only that copy is highlighted. */
  aimedSlot: number | null
  locked: boolean
  started: boolean
  toast: string | null
  open: (o: Overlay) => void
  close: () => void
  setAimed: (aim: { slot: number; productId: string } | null) => void
  setLocked: (v: boolean) => void
  setStarted: (v: boolean) => void
  showToast: (msg: string) => void
}

let toastTimer: ReturnType<typeof setTimeout> | undefined

export const useUI = create<UIState>((set) => ({
  overlay: null,
  aimedId: null,
  aimedSlot: null,
  locked: false,
  started: false,
  toast: null,
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
    }),
    {
      name: 'mall-shop-cart',
      version: 1,
      // Saved carts can be stale or edited by hand: keep only lines that still match the catalog.
      merge: (persisted, current) => {
        const saved = (persisted as Partial<CartState> | undefined)?.items
        const items = (Array.isArray(saved) ? saved : []).flatMap((i): CartItem[] => {
          const p = productById.get(i?.productId)
          if (!p || !p.colours.some((c) => c.name === i.colour)) return []
          if (p.sizes ? !p.sizes.includes(i.size ?? '') : i.size !== undefined) return []
          const qty = Math.floor(Number(i.qty))
          if (!(qty >= 1)) return []
          return [{ key: [p.id, i.colour, i.size ?? ''].join('|'), productId: p.id, colour: i.colour, size: i.size, qty: Math.min(MAX_QTY, qty) }]
        })
        return { ...current, items }
      },
    },
  ),
)

export function cartTotals(items: CartItem[]) {
  let count = 0
  let subtotal = 0
  for (const i of items) {
    const p = productById.get(i.productId)
    if (!p) continue
    count += i.qty
    subtotal += p.price * i.qty
  }
  return { count, subtotal }
}
