import { useEffect, useRef, useState } from 'react'
import { input } from '../lib/input'

const RADIUS = 50

/** On-screen joystick for touch devices. Writes to input.joyX / input.joyY. */
export function Joystick() {
  const base = useRef<HTMLDivElement>(null)
  const pointer = useRef<number | null>(null)
  const [knob, setKnob] = useState({ x: 0, y: 0 })

  // If the joystick disappears mid-drag (e.g. a product panel opens), stop walking.
  useEffect(
    () => () => {
      input.joyX = input.joyY = 0
    },
    [],
  )

  const move = (e: React.PointerEvent) => {
    if (pointer.current !== e.pointerId || !base.current) return
    const r = base.current.getBoundingClientRect()
    let x = e.clientX - (r.left + r.width / 2)
    let y = e.clientY - (r.top + r.height / 2)
    const d = Math.hypot(x, y)
    if (d > RADIUS) {
      x = (x / d) * RADIUS
      y = (y / d) * RADIUS
    }
    setKnob({ x, y })
    input.joyX = x / RADIUS
    input.joyY = -y / RADIUS
  }
  const end = (e: React.PointerEvent) => {
    if (pointer.current !== e.pointerId) return
    pointer.current = null
    setKnob({ x: 0, y: 0 })
    input.joyX = input.joyY = 0
  }

  return (
    <div
      ref={base}
      className="joystick"
      onPointerDown={(e) => {
        pointer.current = e.pointerId
        e.currentTarget.setPointerCapture(e.pointerId)
        move(e)
      }}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <div className="joystick-knob" style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }} />
    </div>
  )
}

/** Full-screen layer behind the HUD: dragging it turns the camera on touch devices. */
export function LookPad({ onTap }: { onTap: (clientX: number, clientY: number) => void }) {
  const last = useRef<{ id: number; x: number; y: number; startX: number; startY: number; t: number } | null>(null)
  return (
    <div
      className="lookpad"
      onPointerDown={(e) => {
        if (last.current) return
        last.current = { id: e.pointerId, x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY, t: performance.now() }
        e.currentTarget.setPointerCapture(e.pointerId)
      }}
      onPointerMove={(e) => {
        const l = last.current
        if (!l || l.id !== e.pointerId) return
        input.lookDX += e.clientX - l.x
        input.lookDY += e.clientY - l.y
        l.x = e.clientX
        l.y = e.clientY
      }}
      onPointerUp={(e) => {
        const l = last.current
        if (l?.id !== e.pointerId) return
        last.current = null
        // A short press that barely moved is a tap, not a look.
        if (Math.hypot(e.clientX - l.startX, e.clientY - l.startY) < 10 && performance.now() - l.t < 400) onTap(e.clientX, e.clientY)
      }}
      onPointerCancel={() => (last.current = null)}
    />
  )
}
