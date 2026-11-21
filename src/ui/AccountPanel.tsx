import { useEffect, useState } from 'react'
import { formatPrice } from '../data/products'
import { supabase, useAuth } from '../lib/supabase'
import { useUI } from '../lib/state'
import { closeOverlay } from './overlay'

interface OrderRow {
  id: string
  total: number
  status: string
  created_at: string
  items: { name: string; qty: number }[]
}

export function AccountPanel() {
  const session = useAuth((s) => s.session)
  return (
    <div className="panel cart" role="dialog" aria-label="Your account">
      <div className="cart-head">
        <h2>{session ? 'Your account' : 'Sign in'}</h2>
        <button className="panel-close static" onClick={closeOverlay} aria-label="Close">
          ×
        </button>
      </div>
      <div className="order-body">{!supabase ? <NotConfigured /> : session ? <SignedIn /> : <SignInForm />}</div>
    </div>
  )
}

function NotConfigured() {
  return <p className="muted">Sign-in isn't set up yet. Add the Supabase settings to .env.local and restart the site.</p>
}

function SignInForm() {
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ kind: 'error' | 'info'; text: string } | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    setBusy(true)
    setMessage(null)
    const { data, error } =
      mode === 'in'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } })
    setBusy(false)
    if (error) return setMessage({ kind: 'error', text: error.message })
    if (mode === 'up' && !data.session) {
      setMessage({ kind: 'info', text: `We've sent a confirmation link to ${email}. Open it, then sign in here.` })
      setMode('in')
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <div className="tabs" role="tablist">
        <button type="button" role="tab" aria-selected={mode === 'in'} className={mode === 'in' ? 'active' : ''} onClick={() => setMode('in')}>
          Sign in
        </button>
        <button type="button" role="tab" aria-selected={mode === 'up'} className={mode === 'up' ? 'active' : ''} onClick={() => setMode('up')}>
          Create account
        </button>
      </div>
      <label>
        Email
        <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label>
        Password
        <input
          type="password"
          required
          minLength={6}
          autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      {message && <p className={message.kind === 'error' ? 'error small' : 'muted small'}>{message.text}</p>}
      <button className="primary" disabled={busy}>
        {busy ? 'Please wait…' : mode === 'in' ? 'Sign in' : 'Create account'}
      </button>
      <p className="muted small">Signing in is optional. It lets you see your past orders.</p>
    </form>
  )
}

function SignedIn() {
  const session = useAuth((s) => s.session)!
  const isAdmin = useAuth((s) => s.isAdmin)
  const open = useUI((s) => s.open)
  const [orders, setOrders] = useState<OrderRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    supabase!
      .from('orders')
      .select('id,total,status,created_at,items')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) setError(error.message)
        else setOrders(data as OrderRow[])
      })
    return () => {
      cancelled = true
    }
  }, [session.user.id])

  return (
    <>
      <p>
        Signed in as <strong>{session.user.email}</strong>
      </p>
      <h3 className="section-title">My orders</h3>
      {error && <p className="error small">{error}</p>}
      {!orders && !error && <p className="muted small">Loading…</p>}
      {orders?.length === 0 && <p className="muted small">No orders yet.</p>}
      {orders && orders.length > 0 && (
        <ul className="lines compact">
          {orders.map((o) => (
            <li key={o.id}>
              <span className="line-info">
                <span>{new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span className="muted small">{o.items.map((i) => `${i.qty} × ${i.name}`).join(', ')}</span>
              </span>
              <strong>{formatPrice(o.total)}</strong>
            </li>
          ))}
        </ul>
      )}
      {isAdmin && (
        <button className="secondary" onClick={() => open({ type: 'admin' })}>
          Open admin: manage products
        </button>
      )}
      <button className="secondary" onClick={() => void supabase!.auth.signOut()}>
        Sign out
      </button>
    </>
  )
}
