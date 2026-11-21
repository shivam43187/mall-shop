import { useUI } from './state'

/** Stripe sends shoppers back to /?checkout=success&session_id=… or /?checkout=cancelled. */
export function handleCheckoutReturn() {
  const params = new URLSearchParams(window.location.search)
  const status = params.get('checkout')
  if (!status) return
  const ui = useUI.getState()
  const sessionId = params.get('session_id')
  if (status === 'success' && sessionId) {
    ui.setStarted(true)
    ui.open({ type: 'order', sessionId })
  } else if (status === 'cancelled') {
    // Reopen the cart so they can carry on or try again.
    ui.setStarted(true)
    ui.open({ type: 'cart' })
    ui.showToast('Checkout cancelled. Your cart is still here.')
  }
  // Tidy the address bar so a refresh doesn't show the receipt again.
  window.history.replaceState(null, '', window.location.pathname)
}
