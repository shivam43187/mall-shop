import { createClient, type Session } from '@supabase/supabase-js'
import { create } from 'zustand'
import { productFromRow, useCatalog, type ProductRow } from '../data/catalog'
import type { Product } from '../data/products'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

/** Browser Supabase client (publishable key only). Null until the project is configured in .env.local. */
export const supabase = url && key ? createClient(url, key) : null

interface AuthState {
  session: Session | null
  isAdmin: boolean
}

export const useAuth = create<AuthState>(() => ({ session: null, isAdmin: false }))

async function refreshAdmin(session: Session | null) {
  if (!supabase || !session) return useAuth.setState({ session, isAdmin: false })
  const { data } = await supabase.from('profiles').select('is_admin').eq('id', session.user.id).maybeSingle()
  // Ignore the answer if the user signed out or changed while we waited.
  if (useAuth.getState().session?.user.id !== session.user.id) return
  useAuth.setState({ isAdmin: !!data?.is_admin })
}

/** Loads products added from the admin page into the catalog. */
export async function loadCatalog() {
  if (!supabase) return useCatalog.getState().setReady(true)
  const { data, error } = await supabase.from('products').select('*').eq('active', true).order('created_at')
  if (error) {
    console.warn('Could not load products from Supabase:', error.message)
    // Keep the built-in products working, but don't treat the catalog as complete (carts aren't pruned).
    return useCatalog.getState().setReady(false)
  }
  useCatalog.getState().setExtra((data as ProductRow[]).map(productFromRow).filter((p): p is Product => p !== null))
}

export function initSupabase() {
  void loadCatalog()
  if (!supabase) return
  supabase.auth.onAuthStateChange((_event, session) => {
    const prev = useAuth.getState().session
    useAuth.setState({ session, ...(prev?.user.id !== session?.user.id ? { isAdmin: false } : {}) })
    // Run outside the auth callback, as Supabase recommends.
    setTimeout(() => void refreshAdmin(session), 0)
  })
}

/** Header for /api calls so the server knows who is checking out. */
export function authHeader(): Record<string, string> {
  const token = useAuth.getState().session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}
