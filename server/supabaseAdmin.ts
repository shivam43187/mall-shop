import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { mergeCatalog, productFromRow, type ProductRow } from '../src/data/catalog'
import type { Product } from '../src/data/products'

let client: SupabaseClient | null | undefined

/**
 * Server-only Supabase client using the secret key. It bypasses row-level security,
 * so it must never be imported by browser code. Returns null when Supabase isn't configured.
 */
export function supabaseAdmin() {
  if (client !== undefined) return client
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY
  client = url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null
  return client
}

/** The full catalog: built-in products plus active ones from the database. */
export async function loadCatalog() {
  const db = supabaseAdmin()
  if (!db) return mergeCatalog([])
  const { data, error } = await db.from('products').select('*').eq('active', true)
  if (error) {
    // Built-in products still sell; only admin-added ones will be rejected until the database is back.
    console.error('Could not load products from Supabase:', error.message)
    return mergeCatalog([])
  }
  return mergeCatalog((data as ProductRow[]).map(productFromRow).filter((p): p is Product => p !== null))
}

/** The signed-in shopper from an `Authorization: Bearer <token>` header, or null. */
export async function userFromHeader(header: string | string[] | undefined) {
  const db = supabaseAdmin()
  const token = typeof header === 'string' && header.startsWith('Bearer ') ? header.slice(7) : null
  if (!db || !token) return null
  const { data } = await db.auth.getUser(token)
  return data.user ? { id: data.user.id, email: data.user.email ?? null } : null
}
