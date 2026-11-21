import { useEffect, useState } from 'react'
import type { Store } from '../data/stores'
import { isTouch, player } from '../lib/input'
import { storeAt, storeNear } from '../lib/walkable'
import { Joystick, LookPad } from './Joystick'
import { Minimap } from './Minimap'

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

export function Hud({ locked }: { locked: boolean }) {
  const { inside, near } = useLocation()
  const [started, setStarted] = useState(false)
  const showIntro = isTouch ? !started : !locked

  return (
    <>
      {isTouch && started && <LookPad />}
      <div className="hud">
        <div className="brand">Mall Shop</div>
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
        {isTouch && started && <Joystick />}
      </div>

      {showIntro && (
        <div className="intro">
          <div className="intro-card">
            <h1>Mall Shop</h1>
            <p>Walk through the mall and step into any store.</p>
            {isTouch ? (
              <ul>
                <li>Use the joystick at the bottom left to walk</li>
                <li>Drag anywhere else to look around</li>
              </ul>
            ) : (
              <ul>
                <li>
                  <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> or arrow keys to walk, <kbd>Shift</kbd> to run
                </li>
                <li>Move the mouse to look around</li>
                <li>
                  <kbd>Esc</kbd> to pause
                </li>
              </ul>
            )}
            <button id="enter-mall" onClick={() => setStarted(true)}>
              Enter the mall
            </button>
          </div>
        </div>
      )}
    </>
  )
}
