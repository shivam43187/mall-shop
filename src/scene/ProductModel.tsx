import type { ReactNode } from 'react'
import type { ModelKind } from '../data/products'

/**
 * Simple procedural models built from primitives, so the store needs no downloaded assets.
 * Each model sits on y = 0, faces +z and fits in roughly a 0.6 m box.
 */

type V3 = [number, number, number]

function Box({ s, p = [0, 0, 0], c, r }: { s: V3; p?: V3; c: string; r?: V3 }) {
  return (
    <mesh position={p} rotation={r} castShadow>
      <boxGeometry args={s} />
      <meshStandardMaterial color={c} roughness={0.6} />
    </mesh>
  )
}

function Cyl({ rt, rb = rt, h, p = [0, 0, 0], c, r, seg = 24, metal = 0 }: { rt: number; rb?: number; h: number; p?: V3; c: string; r?: V3; seg?: number; metal?: number }) {
  return (
    <mesh position={p} rotation={r} castShadow>
      <cylinderGeometry args={[rt, rb, h, seg]} />
      <meshStandardMaterial color={c} roughness={0.5} metalness={metal} />
    </mesh>
  )
}

function Ball({ rad, p = [0, 0, 0], c, sc }: { rad: number; p?: V3; c: string; sc?: V3 }) {
  return (
    <mesh position={p} scale={sc} castShadow>
      <sphereGeometry args={[rad, 24, 18]} />
      <meshStandardMaterial color={c} roughness={0.55} />
    </mesh>
  )
}

const DARK = '#263238'
const SCREEN = '#0d1b2a'

function model(kind: ModelKind, c: string): ReactNode {
  switch (kind) {
    case 'tshirt':
      return (
        <>
          <Box s={[0.36, 0.42, 0.06]} p={[0, 0.21, 0]} c={c} />
          <Box s={[0.14, 0.12, 0.06]} p={[-0.22, 0.36, 0]} r={[0, 0, 0.5]} c={c} />
          <Box s={[0.14, 0.12, 0.06]} p={[0.22, 0.36, 0]} r={[0, 0, -0.5]} c={c} />
        </>
      )
    case 'jeans':
      return (
        <>
          <Box s={[0.34, 0.1, 0.06]} p={[0, 0.5, 0]} c={c} />
          <Box s={[0.15, 0.46, 0.06]} p={[-0.09, 0.23, 0]} r={[0, 0, -0.05]} c={c} />
          <Box s={[0.15, 0.46, 0.06]} p={[0.09, 0.23, 0]} r={[0, 0, 0.05]} c={c} />
        </>
      )
    case 'dress':
      return (
        <>
          <Cyl rt={0.08} rb={0.24} h={0.4} p={[0, 0.2, 0]} c={c} />
          <Box s={[0.16, 0.18, 0.08]} p={[0, 0.49, 0]} c={c} />
        </>
      )
    case 'shoe':
      return (
        <>
          <Box s={[0.12, 0.04, 0.3]} p={[0, 0.02, 0]} c="#fafafa" />
          <Box s={[0.11, 0.08, 0.26]} p={[0, 0.08, -0.01]} c={c} />
          <Box s={[0.1, 0.08, 0.12]} p={[0, 0.15, -0.08]} c={c} />
        </>
      )
    case 'phone':
      return (
        <group rotation={[-0.25, 0, 0]} position={[0, 0.17, 0]}>
          <Box s={[0.16, 0.32, 0.02]} c={c} />
          <Box s={[0.145, 0.3, 0.002]} p={[0, 0, 0.011]} c={SCREEN} />
        </group>
      )
    case 'tablet':
      return (
        <group rotation={[-0.3, 0, 0]} position={[0, 0.2, 0]}>
          <Box s={[0.42, 0.3, 0.02]} c={c} />
          <Box s={[0.39, 0.27, 0.002]} p={[0, 0, 0.011]} c={SCREEN} />
        </group>
      )
    case 'laptop':
      return (
        <>
          <Box s={[0.5, 0.02, 0.34]} p={[0, 0.01, 0]} c={c} />
          <group position={[0, 0.02, -0.17]} rotation={[-0.25, 0, 0]}>
            <Box s={[0.5, 0.32, 0.015]} p={[0, 0.16, 0]} c={c} />
            <Box s={[0.46, 0.28, 0.002]} p={[0, 0.16, 0.009]} c={SCREEN} />
          </group>
        </>
      )
    case 'headphones':
      return (
        <>
          <mesh position={[0, 0.18, 0]} castShadow>
            <torusGeometry args={[0.15, 0.02, 12, 32, Math.PI]} />
            <meshStandardMaterial color={c} />
          </mesh>
          <Cyl rt={0.06} h={0.05} p={[-0.15, 0.14, 0]} r={[0, 0, Math.PI / 2]} c={c} />
          <Cyl rt={0.06} h={0.05} p={[0.15, 0.14, 0]} r={[0, 0, Math.PI / 2]} c={c} />
        </>
      )
    case 'watch':
      return (
        <>
          <Box s={[0.05, 0.3, 0.02]} p={[0, 0.15, -0.02]} c={c} />
          <Box s={[0.1, 0.12, 0.03]} p={[0, 0.16, 0]} c={DARK} />
          <Box s={[0.085, 0.1, 0.002]} p={[0, 0.16, 0.016]} c="#4fc3f7" />
        </>
      )
    case 'speaker':
      return (
        <>
          <Cyl rt={0.09} h={0.24} p={[0, 0.12, 0]} c={c} />
          <Cyl rt={0.092} h={0.02} p={[0, 0.245, 0]} c={DARK} />
        </>
      )
    case 'lamp':
      return (
        <>
          <Cyl rt={0.1} h={0.02} p={[0, 0.01, 0]} c={DARK} metal={0.5} />
          <Cyl rt={0.012} h={0.36} p={[0, 0.19, 0]} c={DARK} metal={0.5} />
          <Cyl rt={0.09} rb={0.16} h={0.16} p={[0, 0.42, 0]} c={c} />
        </>
      )
    case 'mug':
      return (
        <>
          <Cyl rt={0.07} h={0.14} p={[0, 0.07, 0]} c={c} />
          <mesh position={[0.08, 0.07, 0]} castShadow>
            <torusGeometry args={[0.035, 0.012, 8, 16]} />
            <meshStandardMaterial color={c} />
          </mesh>
        </>
      )
    case 'cushion':
      return <Ball rad={0.2} p={[0, 0.2, 0]} sc={[1, 1, 0.4]} c={c} />
    case 'vase':
      return (
        <>
          <Ball rad={0.1} p={[0, 0.1, 0]} c={c} />
          <Cyl rt={0.04} rb={0.05} h={0.16} p={[0, 0.25, 0]} c={c} />
        </>
      )
    case 'candle':
      return (
        <>
          <Cyl rt={0.08} h={0.14} p={[0, 0.07, 0]} c="#90a4ae" />
          <Cyl rt={0.07} h={0.02} p={[0, 0.135, 0]} c={c} />
          <Ball rad={0.015} p={[0, 0.17, 0]} c="#ffb300" />
        </>
      )
    case 'clock':
      return (
        <group position={[0, 0.2, 0]}>
          <Cyl rt={0.2} h={0.04} r={[Math.PI / 2, 0, 0]} c={c} seg={40} />
          <Cyl rt={0.18} h={0.002} p={[0, 0, 0.021]} r={[Math.PI / 2, 0, 0]} c="#fafafa" seg={40} />
          <Box s={[0.012, 0.13, 0.004]} p={[0, 0.05, 0.025]} c={DARK} />
          <Box s={[0.09, 0.012, 0.004]} p={[0.04, 0, 0.025]} c={DARK} />
        </group>
      )
    case 'book':
      return (
        <group position={[0, 0.16, 0]} rotation={[0, 0.2, 0]}>
          <Box s={[0.22, 0.3, 0.05]} c={c} />
          <Box s={[0.205, 0.285, 0.046]} p={[0.008, 0, 0]} c="#fffde7" />
          <Box s={[0.22, 0.3, 0.004]} p={[0, 0, 0.024]} c={c} />
          <Box s={[0.22, 0.3, 0.004]} p={[0, 0, -0.024]} c={c} />
        </group>
      )
    case 'ball':
      return <Ball rad={0.12} p={[0, 0.12, 0]} c={c} />
    case 'dumbbell':
      return (
        <group position={[0, 0.07, 0]}>
          <Cyl rt={0.07} h={0.08} p={[-0.13, 0, 0]} r={[0, 0, Math.PI / 2]} c={c} seg={6} />
          <Cyl rt={0.07} h={0.08} p={[0.13, 0, 0]} r={[0, 0, Math.PI / 2]} c={c} seg={6} />
          <Cyl rt={0.02} h={0.2} r={[0, 0, Math.PI / 2]} c="#b0bec5" metal={0.8} />
        </group>
      )
    case 'bottle':
      return (
        <>
          <Cyl rt={0.05} h={0.24} p={[0, 0.12, 0]} c={c} />
          <Cyl rt={0.035} rb={0.05} h={0.04} p={[0, 0.26, 0]} c={c} />
          <Cyl rt={0.03} h={0.04} p={[0, 0.3, 0]} c={DARK} />
        </>
      )
    case 'racket':
      return (
        <group position={[0, 0.02, 0]} rotation={[-Math.PI / 2 + 0.25, 0, 0]}>
          <mesh position={[0, 0.38, 0]} scale={[1, 1.25, 1]}>
            <torusGeometry args={[0.1, 0.01, 8, 32]} />
            <meshStandardMaterial color={c} />
          </mesh>
          <Cyl rt={0.008} h={0.24} p={[0, 0.14, 0]} c={c} />
          <Cyl rt={0.016} h={0.1} p={[0, 0.03, 0]} c={DARK} />
        </group>
      )
    case 'perfume':
      return (
        <>
          <mesh position={[0, 0.09, 0]} castShadow>
            <boxGeometry args={[0.14, 0.18, 0.07]} />
            <meshPhysicalMaterial color={c} transparent opacity={0.75} roughness={0.05} />
          </mesh>
          <Cyl rt={0.03} h={0.05} p={[0, 0.205, 0]} c="#ffd54f" metal={0.8} />
        </>
      )
    case 'lipstick':
      return (
        <>
          <Cyl rt={0.025} h={0.08} p={[0, 0.04, 0]} c="#ffd54f" metal={0.8} />
          <Cyl rt={0.02} h={0.05} p={[0, 0.105, 0]} c={c} />
        </>
      )
    case 'jar':
      return (
        <>
          <Cyl rt={0.07} h={0.09} p={[0, 0.045, 0]} c={c} />
          <Cyl rt={0.073} h={0.03} p={[0, 0.105, 0]} c="#eceff1" />
        </>
      )
    case 'teddy':
      return (
        <>
          <Ball rad={0.12} p={[0, 0.12, 0]} c={c} />
          <Ball rad={0.09} p={[0, 0.3, 0.01]} c={c} />
          <Ball rad={0.035} p={[-0.07, 0.38, 0]} c={c} />
          <Ball rad={0.035} p={[0.07, 0.38, 0]} c={c} />
          <Ball rad={0.012} p={[-0.03, 0.32, 0.085]} c={DARK} />
          <Ball rad={0.012} p={[0.03, 0.32, 0.085]} c={DARK} />
        </>
      )
    case 'car':
      return (
        <>
          <Box s={[0.18, 0.07, 0.36]} p={[0, 0.07, 0]} c={c} />
          <Box s={[0.15, 0.07, 0.17]} p={[0, 0.14, -0.02]} c={c} />
          {[-1, 1].flatMap((x) =>
            [-1, 1].map((z) => <Cyl key={`${x}${z}`} rt={0.04} h={0.03} p={[x * 0.1, 0.04, z * 0.11]} r={[0, 0, Math.PI / 2]} c={DARK} />),
          )}
        </>
      )
    case 'blocks':
      return (
        <>
          <Box s={[0.12, 0.12, 0.12]} p={[-0.07, 0.06, 0]} c="#e53935" />
          <Box s={[0.12, 0.12, 0.12]} p={[0.07, 0.06, 0]} c="#1e88e5" />
          <Box s={[0.12, 0.12, 0.12]} p={[0, 0.18, 0]} c="#fdd835" r={[0, 0.4, 0]} />
        </>
      )
    case 'apple':
      return (
        <>
          <Ball rad={0.06} p={[-0.07, 0.06, 0]} c={c} />
          <Ball rad={0.06} p={[0.07, 0.06, 0]} c={c} />
          <Ball rad={0.06} p={[0, 0.06, 0.08]} c={c} />
          <Ball rad={0.06} p={[0, 0.15, 0.03]} c={c} />
        </>
      )
    case 'carton':
      return (
        <>
          <Box s={[0.1, 0.22, 0.1]} p={[0, 0.11, 0]} c="#fafafa" />
          <Box s={[0.102, 0.1, 0.102]} p={[0, 0.1, 0]} c={c} />
          <Box s={[0.1, 0.05, 0.07]} p={[0, 0.235, 0]} r={[Math.PI / 4, 0, 0]} c="#fafafa" />
        </>
      )
    case 'bread':
      return (
        <>
          <Box s={[0.14, 0.1, 0.28]} p={[0, 0.05, 0]} c={c} />
          <Cyl rt={0.07} h={0.28} p={[0, 0.1, 0]} r={[Math.PI / 2, 0, 0]} c={c} />
        </>
      )
  }
}

export function ProductModel({ kind, colour }: { kind: ModelKind; colour: string }) {
  return <group>{model(kind, colour)}</group>
}
