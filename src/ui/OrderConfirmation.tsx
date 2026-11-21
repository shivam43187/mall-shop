import { useEffect, useState } from 'react'
import { formatPrice } from '../data/products'
import { useCart } from '../lib/state'
import { closeOverlay } from './overlay'

interface Order {
  id: string
  paid: boolean
  total: number
  email: string | null
  items: { name: string; qty: number; amount: number }[]
}

/** Shown after Stripe sends the shopper back with ?checkout=success. */
export function OrderConfirmation({ sessionId }: { sessionId: string }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(null)
  const clear = useCart((s) => s.clear)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/order?session_id=${encodeURIComponent(sessionId)}`)
      .then(async (r) => {
        const data = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(data.error ?? 'Could not load your order.')
        return data as Order
      })
      .then((o) => {
        if (cancelled) return
        setOrder(o)
        if (o.paid) clear()
      })
      .catch((e: Error) => !cancelled && setError(e.message))
    return () => {
      cancelled = true
    }
  }, [sessionId, clear])

  return (
    <div className="panel cart" role="dialog" aria-label="Order confirmation">
      <div className="cart-head">
        <h2>{order?.paid ? 'Thank you! 🎉' : 'Your order'}</h2>
        <button className="panel-close static" onClick={closeOverlay} aria-label="Close">
          ×
        </button>
      </div>
      <div className="order-body">
        {error && <p className="error">{error}</p>}
        {!order && !error && <p className="muted">Loading your order…</p>}
        {order && (
          <>
            <p>
              {order.paid ? 'Your test payment went through.' : 'Your payment has not completed yet.'}
              {order.email && (
                <>
                  {' '}
                  A receipt would go to <strong>{order.email}</strong>.
                </>
              )}
            </p>
            <ul className="lines compact">
              {order.items.map((i, n) => (
                <li key={n}>
                  <span className="line-info">
                    {i.qty} × {i.name}
                  </span>
                  <strong>{formatPrice(i.amount)}</strong>
                </li>
              ))}
            </ul>
            <div className="subtotal">
              <span>Total paid</span>
              <strong>{formatPrice(order.total)}</strong>
            </div>
            <p className="muted small">Order reference: {order.id.slice(-10)}</p>
          </>
        )}
        <button className="primary" onClick={closeOverlay}>
          Back to the mall
        </button>
      </div>
    </div>
  )
}
