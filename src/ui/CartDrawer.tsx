import { formatPrice, productById } from '../data/products'
import { MAX_QTY, cartTotals, useCart } from '../lib/state'
import { ProductThumb } from './ProductThumb'
import { closeOverlay } from './overlay'

export function CartDrawer() {
  const items = useCart((s) => s.items)
  const setQty = useCart((s) => s.setQty)
  const remove = useCart((s) => s.remove)
  const { count, subtotal } = cartTotals(items)

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
        <button className="primary" disabled title="Checkout arrives in the next step">
          Checkout (coming soon)
        </button>
        <p className="muted small center">Checkout with Stripe test payments is the next step.</p>
        <button className="secondary" onClick={closeOverlay}>
          Keep shopping
        </button>
      </div>
    </div>
  )
}
