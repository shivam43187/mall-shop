import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useState } from 'react'
import { useCatalog } from '../data/catalog'
import { formatPrice, type Product } from '../data/products'
import { storeById } from '../data/stores'
import { MAX_QTY, useCart, useUI } from '../lib/state'
import { ProductModel } from '../scene/ProductModel'
import { closeOverlay } from './overlay'

/** 2D panel for one product, with a live 3D preview you can spin. */
export function ProductPanel({ id }: { id: string }) {
  const product = useCatalog((s) => s.byId.get(id))
  if (!product) {
    return (
      <div className="panel cart" role="dialog">
        <div className="order-body">
          <p>This product is no longer available.</p>
          <button className="primary" onClick={closeOverlay}>
            Back to the mall
          </button>
        </div>
      </div>
    )
  }
  return <ProductDetails product={product} />
}

function ProductDetails({ product }: { product: Product }) {
  const store = storeById.get(product.storeId)!
  const [colour, setColour] = useState(product.colours[0])
  const [size, setSize] = useState<string | undefined>(undefined)
  const [qty, setQty] = useState(1)
  const [needSize, setNeedSize] = useState(false)
  const add = useCart((s) => s.add)
  const showToast = useUI((s) => s.showToast)

  const onAdd = () => {
    if (product.sizes && !size) {
      setNeedSize(true)
      return
    }
    const added = add(product.id, colour.name, size, qty)
    showToast(
      added === 0
        ? `You already have the maximum of ${MAX_QTY} of this in your cart`
        : `Added ${added} × ${product.name} to your cart${added < qty ? ` (limit is ${MAX_QTY})` : ''}`,
    )
    closeOverlay()
  }

  return (
    <div className="panel product-panel" role="dialog" aria-label={product.name}>
      <button className="panel-close" onClick={closeOverlay} aria-label="Close">
        ×
      </button>
      <div className="preview">
        <Canvas camera={{ position: [0, 0.35, 1.1], fov: 40 }} dpr={[1, 2]}>
          <color attach="background" args={[store.accent]} />
          <hemisphereLight args={['#ffffff', '#bbbbbb', 2]} />
          <directionalLight position={[2, 3, 2]} intensity={1.5} />
          <group scale={1.3}>
            <ProductModel kind={product.kind} colour={colour.hex} />
          </group>
          <OrbitControls target={[0, 0.22, 0]} autoRotate autoRotateSpeed={2} enablePan={false} minDistance={0.6} maxDistance={2} />
        </Canvas>
        <div className="preview-hint">Drag to spin</div>
      </div>
      <div className="details">
        <div className="store-chip" style={{ background: store.color }}>
          {store.name} · {store.category}
        </div>
        <h2>{product.name}</h2>
        <div className="price">{formatPrice(product.price)}</div>
        <p className="desc">{product.description}</p>

        {product.colours.length > 1 && (
          <div className="option">
            <div className="option-label">
              Colour: <strong>{colour.name}</strong>
            </div>
            <div className="swatches">
              {product.colours.map((c) => (
                <button
                  key={c.name}
                  className={`swatch${c.name === colour.name ? ' selected' : ''}`}
                  style={{ background: c.hex }}
                  onClick={() => setColour(c)}
                  aria-label={c.name}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        )}

        {product.sizes && (
          <div className="option">
            <div className="option-label">
              Size{needSize && <span className="error"> · Please choose a size</span>}
            </div>
            <div className="chips">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  className={`chip${s === size ? ' selected' : ''}`}
                  onClick={() => {
                    setSize(s)
                    setNeedSize(false)
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="buy-row">
          <div className="stepper" aria-label="Quantity">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Fewer">
              −
            </button>
            <span>{qty}</span>
            <button onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))} aria-label="More">
              +
            </button>
          </div>
          <button className="primary" onClick={onAdd}>
            Add to cart · {formatPrice(product.price * qty)}
          </button>
        </div>
      </div>
    </div>
  )
}
