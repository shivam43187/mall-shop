import { controls, isTouch } from '../lib/input'
import { useUI, type Overlay } from '../lib/state'

/** Close the product panel or cart and go back to walking (re-captures the mouse on desktop). */
export function closeOverlay() {
  useUI.getState().close()
  if (!isTouch) controls.lock()
}

export function openOverlay(o: Exclude<Overlay, null>) {
  useUI.getState().open(o)
  if (!isTouch) controls.unlock()
}

export const openCart = () => openOverlay({ type: 'cart' })
