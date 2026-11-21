import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { MAX_PER_STORE, useCatalog } from '../data/catalog'
import { formatPrice, type Product } from '../data/products'
import { MALL, STORES, storeFrontX, type Store } from '../data/stores'
import { controls, isTouch, picker } from '../lib/input'
import { useUI } from '../lib/state'
import { ProductModel } from './ProductModel'

const { storeDepth: D, storeWidth: W } = MALL

/** How close you must be to pick up a product, in metres. */
const REACH = 4.5

interface Slot {
  product: Product
  position: [number, number, number]
  rotationY: number
  tag: boolean
  scale: number
}

/** Where each store's products sit: two per display table, and a row along two of the back shelves. */
function slotsFor(store: Store, all: Product[]): Slot[] {
  const products = all.filter((p) => p.storeId === store.id).slice(0, MAX_PER_STORE)
  if (products.length === 0) return []
  const { x, dir } = storeFrontX(store)
  // Face the store entrance, i.e. back toward the hallway.
  const rotationY = dir === -1 ? Math.PI / 2 : -Math.PI / 2
  const slots: Slot[] = []

  const tableX = x + (dir * D) / 2
  const tableTop = 0.94
  // Tables run along the hallway (z), so two products sit side by side as you walk in.
  const tableSpots = [store.z - 3.1, store.z - 1.9, store.z + 1.9, store.z + 3.1]
  tableSpots.forEach((pz, i) => {
    const product = products[i % products.length]
    slots.push({ product, position: [tableX, tableTop, pz], rotationY, tag: true, scale: 1.6 })
  })

  const shelfX = x + dir * (D - 0.55)
  const span = W - 2.5
  // Up to 8 products: both rows show everything. More than that: split them across the two rows.
  const half = Math.ceil(products.length / 2)
  const rows: [number, boolean, Product[]][] =
    products.length <= 8 ? [[1.44, true, products], [0.64, false, products]] : [[1.44, true, products.slice(0, half)], [0.64, true, products.slice(half)]]
  for (const [y, tag, row] of rows) {
    row.forEach((product, i) => {
      const pz = store.z - span / 2 + (span * (i + 0.5)) / row.length
      // Scale 1.2 keeps the tallest models (~0.58 m) under the shelf above (~0.72 m clearance).
      slots.push({ product, position: [shelfX, y, pz], rotationY, tag, scale: 1.2 })
    })
  }
  return slots
}

const tagCache = new Map<string, THREE.CanvasTexture>()
function priceTag(price: number) {
  const label = formatPrice(price)
  let tex = tagCache.get(label)
  if (!tex) {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 96
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 256, 96)
    ctx.fillStyle = '#e53935'
    ctx.fillRect(0, 0, 12, 96)
    ctx.fillStyle = '#1d1d1f'
    ctx.font = 'bold 52px "Segoe UI", Helvetica, Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, 134, 50)
    tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    tagCache.set(label, tex)
  }
  return tex
}

function ProductItem({ slot, index }: { slot: Slot; index: number }) {
  const { product } = slot
  const aimed = useUI((s) => s.aimedSlot === index)
  const spin = useRef<THREE.Group>(null)

  useFrame((_, dt) => {
    if (!spin.current) return
    // Aimed products turn slowly so you can see you've picked them; others ease back.
    const r = spin.current.rotation
    if (aimed) r.y = THREE.MathUtils.euclideanModulo(r.y + dt * 1.2 + Math.PI, Math.PI * 2) - Math.PI
    else r.y *= 0.85
  })

  return (
    <group position={slot.position} rotation-y={slot.rotationY} scale={slot.scale} userData={{ slot: index, productId: product.id }}>
      <group ref={spin}>
        <ProductModel kind={product.kind} colour={product.colours[0].hex} />
      </group>
      {aimed && (
        <mesh rotation-x={-Math.PI / 2} position-y={0.005}>
          <ringGeometry args={[0.26, 0.31, 40]} />
          <meshBasicMaterial color="#ffd54f" toneMapped={false} />
        </mesh>
      )}
      {slot.tag && (
        <mesh position={[0, 0.03, 0.27]} rotation-x={-0.5}>
          <planeGeometry args={[0.2, 0.075]} />
          <meshBasicMaterial map={priceTag(product.price)} />
        </mesh>
      )}
      {/* Invisible, generous hit box so small products are easy to pick. */}
      <mesh position-y={0.25} visible={false}>
        <boxGeometry args={[0.45, 0.5, 0.45]} />
      </mesh>
    </group>
  )
}

/** Finds the product slot an object belongs to by walking up to the ProductItem group. */
function slotOf(obj: THREE.Object3D | null): { slot: number; productId: string } | null {
  for (let o = obj; o; o = o.parent) {
    if (typeof o.userData.slot === 'number') return { slot: o.userData.slot, productId: o.userData.productId }
  }
  return null
}

/** People and decorations don't block picking; walls, glass and fixtures do. */
function isSeeThrough(obj: THREE.Object3D) {
  for (let o: THREE.Object3D | null = obj; o; o = o.parent) if (o.userData.noPick) return true
  return false
}

/** All products in all stores, plus picking (crosshair on desktop, tap on touch). */
export function Products() {
  const all = useCatalog((s) => s.products)
  const slots = useMemo(() => STORES.flatMap((s) => slotsFor(s, all)), [all])
  const { camera, gl, scene } = useThree()
  const raycaster = useMemo(() => {
    const r = new THREE.Raycaster()
    r.far = REACH
    return r
  }, [])
  const lastAim = useRef(0)

  useEffect(() => {
    // Raycast the whole scene and take the nearest hit, so walls and glass block products behind them.
    const pickAt = (ndc: THREE.Vector2) => {
      raycaster.setFromCamera(ndc, camera)
      return slotOf(raycaster.intersectObject(scene, true).find((h) => !isSeeThrough(h.object))?.object ?? null)
    }
    aim.pick = pickAt
    picker.pick = (clientX, clientY) => {
      const r = gl.domElement.getBoundingClientRect()
      return pickAt(new THREE.Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1))?.productId ?? null
    }
    // Desktop: clicking while walking opens the product under the crosshair.
    const onDown = (e: MouseEvent) => {
      const ui = useUI.getState()
      if (e.button !== 0 || !ui.locked || ui.overlay || !ui.aimedId) return
      ui.open({ type: 'product', id: ui.aimedId })
      controls.unlock()
    }
    if (!isTouch) window.addEventListener('mousedown', onDown)
    return () => {
      window.removeEventListener('mousedown', onDown)
      picker.pick = () => null
      aim.pick = () => null
    }
  }, [camera, gl, scene, raycaster])

  useFrame((state) => {
    if (isTouch) return
    const ui = useUI.getState()
    if (!ui.locked || ui.overlay) {
      if (ui.aimedSlot !== null && !ui.overlay) ui.setAimed(null)
      return
    }
    if (state.clock.elapsedTime - lastAim.current < 0.1) return
    lastAim.current = state.clock.elapsedTime
    ui.setAimed(aim.pick(new THREE.Vector2(0, 0)))
  })

  return (
    <>
      {slots.map((slot, i) => (
        <ProductItem key={i} slot={slot} index={i} />
      ))}
    </>
  )
}

const aim = { pick: (_ndc: THREE.Vector2): { slot: number; productId: string } | null => null }
