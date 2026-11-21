import { useEffect, useState } from 'react'
import { useCatalog } from '../data/catalog'
import { formatPrice } from '../data/products'
import type { Store } from '../data/stores'
import { controls, isTouch, picker, player } from '../lib/input'
import { cartTotals, useCart, useUI } from '../lib/state'
import { storeAt, storeNear } from '../lib/walkable'
import { CartDrawer } from './CartDrawer'
import { Joystick, LookPad } from './Joystick'
import { Minimap } from './Minimap'
import { ProductPanel } from './ProductPanel'
import { useAuth } from '../lib/supabase'
import { AccountPanel } from './AccountPanel'
import { AdminPanel } from './AdminPanel'
import { OrderConfirmation } from './OrderConfirmation'
import { openCart, openOverlay } from './overlay'

function useLocation() {
  const [loc, setLoc] = useState<{ inside?: Store; near?: Store }>({})
  useEffect(() => {
    const id = setInterval(() => {
      const inside = storeAt(player.x, player.z)
      const near = inside ? undefined : storeNear(player.x, player.z)
      setLoc((prev) => (prev.inside === inside && prev.near === near ? prev : { inside, near }))
    }, 150)
    return () => clearInterval(id)
  }, [])
  return loc
}

function CartButton() {
  const items = useCart((s) => s.items)
  const locked = useUI((s) => s.locked)
  const byId = useCatalog((s) => s.byId)
  const { count, subtotal } = cartTotals(items, byId)
  return (
    <button className="cart-button" onClick={openCart} aria-label={`Cart, ${count} items`}>
      <span aria-hidden>🛒</span>
      <span className="cart-count">{count}</span>
      {count > 0 && <span className="cart-sub">{formatPrice(subtotal)}</span>}
      {!isTouch && locked && <kbd>C</kbd>}
    </button>
  )
}

function AccountButton() {
  const session = useAuth((s) => s.session)
  return (
    <button className="cart-button light" onClick={() => openOverlay({ type: 'account' })}>
      <span aria-hidden>👤</span>
      <span>{session ? 'Account' : 'Sign in'}</span>
    </button>
  )
}

function Hint({ inside }: { inside?: Store }) {
  const aimedId = useUI((s) => s.aimedId)
  const byId = useCatalog((s) => s.byId)
  const aimed = aimedId ? byId.get(aimedId) : undefined
  if (aimed) {
    return (
      <div className="hint">
        <strong>{aimed.name}</strong> · {formatPrice(aimed.price)} — click to view
      </div>
    )
  }
  if (inside) {
    return <div className="hint subtle">{isTouch ? 'Tap a product to see it' : 'Point at a product and click to see it'}</div>
  }
  return null
}

function usePruneCart() {
  const complete = useCatalog((s) => s.complete)
  const byId = useCatalog((s) => s.byId)
  const prune = useCart((s) => s.prune)
  useEffect(() => {
    if (complete) prune(byId)
  }, [complete, byId, prune])
}

export function Hud() {
  usePruneCart()
  const { inside, near } = useLocation()
  const overlay = useUI((s) => s.overlay)
  const locked = useUI((s) => s.locked)
  const started = useUI((s) => s.started)
  const toast = useUI((s) => s.toast)
  const setStarted = useUI((s) => s.setStarted)
  const open = useUI((s) => s.open)

  const showIntro = !overlay && (isTouch ? !started : !locked)

  const enter = () => {
    setStarted(true)
    if (!isTouch) controls.lock()
  }

  const onTap = (x: number, y: number) => {
    const id = picker.pick(x, y)
    if (id) open({ type: 'product', id })
  }

  return (
    <>
      {isTouch && started && !overlay && <LookPad onTap={onTap} />}
      {/* Outside .hud so the buttons stay clickable above the pause card and panels. */}
      <div className={`top-left${overlay ? ' overlay-open' : ''}`}>
        <div className="brand">Mall Shop</div>
        {started && <CartButton />}
        {started && <AccountButton />}
      </div>
      <div className="hud">
        {inside ? (
          <div className="location" style={{ borderColor: inside.color }}>
            <span className="dot" style={{ background: inside.color }} />
            You're in <strong>{inside.name}</strong> · {inside.category}
          </div>
        ) : near ? (
          <div className="location" style={{ borderColor: near.color }}>
            <span className="dot" style={{ background: near.color }} />
            Walk in to visit <strong>{near.name}</strong>
          </div>
        ) : null}
        <Minimap />
        {!isTouch && locked && <div className="crosshair" />}
        {!overlay && started && <Hint inside={inside} />}
        {isTouch && started && !overlay && <Joystick />}
        {toast && <div className="toast">{toast}</div>}
      </div>

      {overlay && (
        <div className="backdrop">
          {overlay.type === 'product' ? (
            <ProductPanel key={overlay.id} id={overlay.id} />
          ) : overlay.type === 'order' ? (
            <OrderConfirmation sessionId={overlay.sessionId} />
          ) : overlay.type === 'account' ? (
            <AccountPanel />
          ) : overlay.type === 'admin' ? (
            <AdminPanel />
          ) : (
            <CartDrawer />
          )}
        </div>
      )}

      {showIntro && (
        <div className="intro">
          <div className="intro-card">
            <h1>{started ? 'Paused' : 'Mall Shop'}</h1>
            <p>Walk through the mall, step into any store and pick up what you like.</p>
            {isTouch ? (
              <ul>
                <li>Use the joystick at the bottom left to walk</li>
                <li>Drag anywhere else to look around</li>
                <li>Tap a product to see it</li>
              </ul>
            ) : (
              <ul>
                <li>
                  <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> or arrow keys to walk, <kbd>Shift</kbd> to run
                </li>
                <li>Move the mouse to look, click a product to see it</li>
                <li>
                  <kbd>C</kbd> opens your cart, <kbd>Esc</kbd> pauses
                </li>
              </ul>
            )}
            <button id="enter-mall" onClick={enter}>
              {started ? 'Resume' : 'Enter the mall'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
