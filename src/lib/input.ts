/** Shared, mutable input state written by keyboard/touch handlers and read every frame. */
export const input = {
  keys: new Set<string>(),
  /** Joystick vector, -1..1. y is forward. */
  joyX: 0,
  joyY: 0,
  /** Accumulated touch-look deltas in pixels, consumed each frame. */
  lookDX: 0,
  lookDY: 0,
}

/** Player position, written each frame for the HUD and minimap. */
export const player = { x: 0, z: 28, yaw: 0 }

export const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

/** Set by the Player so UI buttons can re-capture the mouse (desktop). */
export const controls = {
  lock: () => {},
  unlock: () => {},
}

/** Set by the Picker: returns the product id at a screen point, if one is close enough. */
export const picker = {
  pick: (_clientX: number, _clientY: number): string | null => null,
}
