import { useEffect, useRef } from 'react'
import { MALL, STORES, storeFrontX } from '../data/stores'
import { player } from '../lib/input'

const { hallHalfWidth: HW, hallHalfLength: HL, storeDepth: D, storeWidth: W } = MALL
const S = 3 // pixels per metre
const PAD = 4
const OX = HW + D // world x offset so the map starts at 0
const width = (OX * 2) * S + PAD * 2
const height = HL * 2 * S + PAD * 2
const toX = (x: number) => (x + OX) * S + PAD
const toY = (z: number) => (z + HL) * S + PAD

/** Top-down map of the mall with a live "you are here" arrow. */
export function Minimap() {
  const me = useRef<SVGGElement>(null)
  useEffect(() => {
    let raf = 0
    const tick = () => {
      // yaw 0 faces -z (up on the map); positive yaw turns left.
      me.current?.setAttribute('transform', `translate(${toX(player.x)} ${toY(player.z)}) rotate(${(-player.yaw * 180) / Math.PI})`)
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <svg className="minimap" width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-label="Mall map">
      <rect x={toX(-HW)} y={toY(-HL)} width={HW * 2 * S} height={HL * 2 * S} fill="#f3efe9" />
      {STORES.map((s) => {
        const { x, dir } = storeFrontX(s)
        const x0 = dir === -1 ? x - D : x
        return (
          <g key={s.id}>
            <rect x={toX(x0)} y={toY(s.z - W / 2)} width={D * S} height={W * S} fill={s.color} opacity={0.85} />
            <text x={toX(x0 + D / 2)} y={toY(s.z) + 3} fontSize="6.5" fontWeight="600" fill="#fff" textAnchor="middle">
              {s.name.split(' ')[0]}
            </text>
          </g>
        )
      })}
      <circle cx={toX(0)} cy={toY(0)} r={2.4 * S} fill="#4fc3f7" />
      <g ref={me}>
        <path d="M0,-6 L4.5,5 L0,2.5 L-4.5,5 Z" fill="#111" stroke="#fff" strokeWidth="1" />
      </g>
    </svg>
  )
}
