import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import * as THREE from 'three'

/** Animation inputs a parent updates every frame. */
export interface CharacterAnim {
  /** 0 = standing, 1 = full walking stride. */
  walk: number
  /** 0..1, raises the right arm to wave. */
  wave: number
}

export interface Look {
  skin: string
  hair: string
  top: string
  bottom: string
  /** Optional apron in the store's colour (shopkeepers). */
  apron?: string
  /** Plain white figure with no face (mannequins). */
  mannequin?: boolean
  height?: number
}

/**
 * A simple, friendly low-poly person built from primitives (about 1.7 m tall, facing +z).
 * Limbs pivot at the hips and shoulders so walking and waving read clearly from a distance.
 */
export function Character({ look, anim }: { look: Look; anim?: React.RefObject<CharacterAnim> }) {
  const legL = useRef<THREE.Group>(null)
  const legR = useRef<THREE.Group>(null)
  const armL = useRef<THREE.Group>(null)
  const armR = useRef<THREE.Group>(null)
  const body = useRef<THREE.Group>(null)
  const [startPhase] = useState(() => Math.random() * Math.PI * 2)
  const phase = useRef(startPhase)

  useFrame((state, dt) => {
    if (!anim?.current) return
    const { walk, wave } = anim.current
    phase.current += dt * 7 * walk
    const swing = Math.sin(phase.current) * 0.6 * walk
    legL.current!.rotation.x = swing
    legR.current!.rotation.x = -swing
    armL.current!.rotation.x = -swing * 0.8
    // Waving: lift the right arm overhead and rock it side to side.
    const t = state.clock.elapsedTime
    armR.current!.rotation.x = swing * 0.8 * (1 - wave)
    armR.current!.rotation.z = wave * (2.6 + Math.sin(t * 10) * 0.35)
    // A gentle bob while walking, and breathing while standing.
    body.current!.position.y = Math.abs(Math.sin(phase.current)) * 0.04 * walk + Math.sin(t * 2) * 0.006
  })

  const skin = look.mannequin ? '#f2f2f2' : look.skin
  const s = (look.height ?? 1.7) / 1.7

  return (
    // noPick: people never block the crosshair from products behind them.
    <group scale={s} userData={{ noPick: true }}>
      <group ref={body}>
        {/* Legs (pivot at the hip) */}
        {([[-0.1, legL], [0.1, legR]] as const).map(([x, ref]) => (
          <group key={x} ref={ref} position={[x, 0.85, 0]}>
            <mesh position-y={-0.4}>
              <capsuleGeometry args={[0.075, 0.65, 4, 8]} />
              <meshStandardMaterial color={look.mannequin ? skin : look.bottom} />
            </mesh>
          </group>
        ))}
        {/* Torso */}
        <mesh position-y={1.15} castShadow>
          <capsuleGeometry args={[0.2, 0.38, 4, 12]} />
          <meshStandardMaterial color={look.mannequin ? skin : look.top} />
        </mesh>
        {look.apron && (
          <mesh position={[0, 1.05, 0.17]}>
            <boxGeometry args={[0.34, 0.55, 0.04]} />
            <meshStandardMaterial color={look.apron} />
          </mesh>
        )}
        {/* Arms (pivot at the shoulder) */}
        {([[-0.27, armL], [0.27, armR]] as const).map(([x, ref]) => (
          <group key={x} ref={ref} position={[x, 1.42, 0]}>
            <mesh position-y={-0.3}>
              <capsuleGeometry args={[0.06, 0.5, 4, 8]} />
              <meshStandardMaterial color={look.mannequin ? skin : look.top} />
            </mesh>
            <mesh position-y={-0.62}>
              <sphereGeometry args={[0.065, 10, 8]} />
              <meshStandardMaterial color={skin} />
            </mesh>
          </group>
        ))}
        {/* Head */}
        <mesh position-y={1.62} castShadow>
          <sphereGeometry args={[0.14, 18, 14]} />
          <meshStandardMaterial color={skin} />
        </mesh>
        {!look.mannequin && (
          <>
            <mesh position={[0, 1.68, -0.02]} scale={[1, 0.75, 1]}>
              <sphereGeometry args={[0.15, 18, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color={look.hair} />
            </mesh>
            {[-0.05, 0.05].map((x) => (
              <mesh key={x} position={[x, 1.64, 0.125]}>
                <sphereGeometry args={[0.018, 8, 6]} />
                <meshStandardMaterial color="#1a1a1a" />
              </mesh>
            ))}
          </>
        )}
      </group>
    </group>
  )
}
