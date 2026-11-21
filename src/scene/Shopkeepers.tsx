import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { KEEPERS } from '../data/keepers'
import { LAYOUTS } from '../data/layout'
import { STORES, type Store } from '../data/stores'
import { player } from '../lib/input'
import { useUI } from '../lib/state'
import { storeAt } from '../lib/walkable'
import { Character, type CharacterAnim } from './Character'

const WAVE_SECONDS = 2.5

function Shopkeeper({ store }: { store: Store }) {
  const layout = LAYOUTS.get(store.id)!
  const keeper = KEEPERS[store.id]
  const group = useRef<THREE.Group>(null)
  const anim = useRef<CharacterAnim>({ walk: 0, wave: 0 })
  const waveUntil = useRef(0)
  const wasInside = useRef(false)
  // When idle, face across the store (away from the side wall behind them).
  const idleYaw = layout.counterSide === 1 ? Math.PI : 0

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    const t = state.clock.elapsedTime
    const inside = storeAt(player.x, player.z)?.id === store.id
    if (inside && !wasInside.current) {
      waveUntil.current = t + WAVE_SECONDS
      useUI.getState().greet(store.id)
    } else if (!inside && wasInside.current) {
      useUI.getState().leave(store.id)
    }
    wasInside.current = inside

    // Turn to look at the shopper while they're in the store.
    const target = inside ? Math.atan2(player.x - layout.keeper.x, player.z - layout.keeper.z) : idleYaw
    let diff = target - g.rotation.y
    diff = Math.atan2(Math.sin(diff), Math.cos(diff))
    g.rotation.y += diff * Math.min(1, dt * 4)

    const wantWave = t < waveUntil.current ? 1 : 0
    anim.current.wave += (wantWave - anim.current.wave) * Math.min(1, dt * 6)
  })

  return (
    <group ref={group} position={[layout.keeper.x, 0, layout.keeper.z]} rotation-y={idleYaw}>
      <Character look={{ skin: keeper.skin, hair: keeper.hair, top: '#fafafa', bottom: '#37474f', apron: store.color }} anim={anim} />
    </group>
  )
}

export function Shopkeepers() {
  return (
    <>
      {STORES.map((s) => (
        <Shopkeeper key={s.id} store={s} />
      ))}
    </>
  )
}

