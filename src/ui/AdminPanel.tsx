import { useCallback, useEffect, useState } from 'react'
import { MAX_PER_STORE, MODEL_KINDS, useCatalog, type ProductRow } from '../data/catalog'
import { formatPrice } from '../data/products'
import { STORES, storeById, type StoreId } from '../data/stores'
import { loadCatalog, supabase, useAuth } from '../lib/supabase'
import { closeOverlay } from './overlay'

/** Admin-only screen to add products to stores. The database also enforces admin-only writes. */
export function AdminPanel() {
  const isAdmin = useAuth((s) => s.isAdmin)
  const [rows, setRows] = useState<ProductRow[]>([])
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!supabase) return
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setRows(data as ProductRow[])
    await loadCatalog()
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const setActive = async (id: string, active: boolean) => {
    const { error } = await supabase!.from('products').update({ active }).eq('id', id)
    if (error) setError(error.message)
    await refresh()
  }
  const remove = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This can't be undone.`)) return
    const { error } = await supabase!.from('products').delete().eq('id', id)
    if (error) setError(error.message)
    await refresh()
  }

  return (
    <div className="panel admin" role="dialog" aria-label="Admin">
      <div className="cart-head">
        <h2>Admin · Products</h2>
        <button className="panel-close static" onClick={closeOverlay} aria-label="Close">
          ×
        </button>
      </div>
      <div className="order-body">
        {!isAdmin ? (
          <p className="muted">Only admins can manage products.</p>
        ) : (
          <>
            <AddProductForm onAdded={refresh} />
            {error && <p className="error small">{error}</p>}
            <h3 className="section-title">Added products ({rows.length})</h3>
            {rows.length === 0 && <p className="muted small">None yet. The 48 built-in products are always in the stores.</p>}
            <ul className="lines compact">
              {rows.map((r) => (
                <li key={r.id}>
                  <span className="line-info">
                    <span>
                      {r.name} {!r.active && <span className="muted small">(hidden)</span>}
                    </span>
                    <span className="muted small">
                      {storeById.get(r.store_id as StoreId)?.name ?? r.store_id} · {formatPrice(r.price)}
                    </span>
                  </span>
                  <span className="row-actions">
                    <button className="link dark" onClick={() => void setActive(r.id, !r.active)}>
                      {r.active ? 'Hide' : 'Show'}
                    </button>
                    <button className="link" onClick={() => void remove(r.id, r.name)}>
                      Delete
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}

function AddProductForm({ onAdded }: { onAdded: () => Promise<void> }) {
  const [storeId, setStoreId] = useState<StoreId>('fashion')
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [kind, setKind] = useState('tshirt')
  const [colourName, setColourName] = useState('Default')
  const [colourHex, setColourHex] = useState('#1e88e5')
  const [sizes, setSizes] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ kind: 'error' | 'info'; text: string } | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const inStore = useCatalog.getState().products.filter((p) => p.storeId === storeId).length
    if (inStore >= MAX_PER_STORE) {
      return setMessage({ kind: 'error', text: `${storeById.get(storeId)!.name} is full (${MAX_PER_STORE} products). Hide or delete one first.` })
    }
    const rupees = Number(price)
    if (!Number.isInteger(rupees) || rupees < 1) return setMessage({ kind: 'error', text: 'Price must be a whole number of rupees.' })
    setBusy(true)
    setMessage(null)
    const sizeList = sizes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const { error } = await supabase!.from('products').insert({
      store_id: storeId,
      name: name.trim(),
      price: rupees,
      description: description.trim(),
      kind,
      colours: [{ name: colourName.trim() || 'Default', hex: colourHex }],
      sizes: sizeList.length ? sizeList : null,
    })
    setBusy(false)
    if (error) return setMessage({ kind: 'error', text: error.message })
    setMessage({ kind: 'info', text: `Added "${name.trim()}" to ${storeById.get(storeId)!.name}. It's on the shelves now.` })
    setName('')
    setPrice('')
    setDescription('')
    await onAdded()
  }

  return (
    <form className="form grid" onSubmit={submit}>
      <label>
        Store
        <select value={storeId} onChange={(e) => setStoreId(e.target.value as StoreId)}>
          {STORES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.category})
            </option>
          ))}
        </select>
      </label>
      <label>
        3D model
        <select value={kind} onChange={(e) => setKind(e.target.value)}>
          {MODEL_KINDS.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </label>
      <label className="span2">
        Name
        <input required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label>
        Price (₹)
        <input required inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} />
      </label>
      <label>
        Sizes (optional, comma-separated)
        <input placeholder="S, M, L" value={sizes} onChange={(e) => setSizes(e.target.value)} />
      </label>
      <label>
        Colour name
        <input maxLength={30} value={colourName} onChange={(e) => setColourName(e.target.value)} />
      </label>
      <label>
        Colour
        <input type="color" value={colourHex} onChange={(e) => setColourHex(e.target.value)} />
      </label>
      <label className="span2">
        Description
        <textarea maxLength={500} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      {message && <p className={`span2 ${message.kind === 'error' ? 'error small' : 'muted small'}`}>{message.text}</p>}
      <button className="primary span2" disabled={busy}>
        {busy ? 'Adding…' : 'Add product'}
      </button>
    </form>
  )
}
