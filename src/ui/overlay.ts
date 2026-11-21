import { controls, isTouch } from '../lib/input'
import { useUI } from '../lib/state'

/** Close the product panel or cart and go back to walking (re-captures the mouse on desktop). */
export function closeOverlay() {
  useUI.getState().close()
  if (!isTouch) controls.lock()
}

export function openCart() {
  useUI.getState().open({ type: 'cart' })
  if (!isTouch) controls.unlock()
}
