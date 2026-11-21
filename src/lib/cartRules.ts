import type { Product } from '../data/products'

/** A cart line is valid if its product, colour and size still exist. Shared by the browser and the server. */
export function lineMatchesCatalog(i: { productId?: unknown; colour?: unknown; size?: unknown }, byId: Map<string, Product>) {
  const p = typeof i.productId === 'string' ? byId.get(i.productId) : undefined
  if (!p || !p.colours.some((c) => c.name === i.colour)) return false
  return p.sizes ? typeof i.size === 'string' && p.sizes.includes(i.size) : i.size === undefined || i.size === null
}
