import { useState } from 'react'
import { formatPrice, productById } from '../data/products'
import { MAX_QTY, cartTotals, useCart } from '../lib/state'
import { ProductThumb } from './ProductThumb'
import { closeOverlay } from './overlay'

export function CartDrawer() {
  const items = useCart((s) => s.items)
  const setQty = useCart((s) => s.setQty)
  const remove = useCart((s) => s.remove)
  const { count, subtotal } = cartTotals(items)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkout = async () => {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items.map(({ productId, colour, size, qty }) => ({ productId, colour, size, qty })) }),
      })
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string }
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Could not start checkout. Please try again.')
      window.location.assign(data.url)
    } catch (e) {
      setError((e as Error).message === 'Failed to fetch' ? 'Could not reach the server. Check your connection.' : (e as Error).message)
      setBusy(false)
    }
  }

  return (
    <div className="panel cart" role="dialog" aria-label="Your cart">
      <div className="cart-head">
        <h2>Your cart {count > 0 && <span className="muted">({count})</span>}</h2>
        <button className="panel-close static" onClick={closeOverlay} aria-label="Close">
          ×
        </button>
      </div>
      {items.length === 0 ? (
        <div className="empty">
          <p>Your cart is empty.</p>
          <p className="muted">Walk into a store and pick something up.</p>
        </div>
      ) : (
        <ul className="lines">
          {items.map((i) => {
            const p = productById.get(i.productId)!
            const colour = p.colours.find((c) => c.name === i.colour) ?? p.colours[0]
            return (
              <li key={i.key}>
                <ProductThumb kind={p.kind} colour={colour.hex} />
                <div className="line-info">
                  <div className="line-name">{p.name}</div>
                  <div className="muted small">{[p.colours.length > 1 ? i.colour : null, i.size].filter(Boolean).join(' · ') || ' '}</div>
                  <div className="stepper small">
                    <button onClick={() => setQty(i.key, i.qty - 1)} aria-label="Fewer">
                      −
                    </button>
                    <span>{i.qty}</span>
                    <button onClick={() => setQty(i.key, i.qty + 1)} disabled={i.qty >= MAX_QTY} aria-label="More">
                      +
                    </button>
                  </div>
                </div>
                <div className="line-right">
                  <div className="line-price">{formatPrice(p.price * i.qty)}</div>
                  <button className="link" onClick={() => remove(i.key)}>
                    Remove
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
      <div className="cart-foot">
        <div className="subtotal">
          <span>Subtotal</span>
          <strong>{formatPrice(subtotal)}</strong>
        </div>
        <button className="primary" disabled={items.length === 0 || busy} onClick={checkout}>
          {busy ? 'Opening secure checkout…' : 'Checkout'}
        </button>
        {error && <p className="error small center">{error}</p>}
        <p className="muted small center">
          Test mode: no real money is taken. Pay with card <strong>4242 4242 4242 4242</strong>, any future date and any CVC.
        </p>
        <button className="secondary" onClick={closeOverlay}>
          Keep shopping
        </button>
      </div>
    </div>
  )
}
