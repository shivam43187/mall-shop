import Stripe from 'stripe'
import type { Product } from '../src/data/products'
import { MAX_QTY } from '../src/lib/limits'
import { lineMatchesCatalog } from '../src/lib/cartRules'
import { loadCatalog, supabaseAdmin, userFromHeader } from './supabaseAdmin'

export class HttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function stripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new HttpError(503, 'Checkout is not set up yet: STRIPE_SECRET_KEY is missing.')
  if (!key.startsWith('sk_test_')) throw new HttpError(503, 'Only Stripe test keys (sk_test_…) are allowed while the shop is in test mode.')
  return new Stripe(key)
}

interface RequestLine {
  productId: string
  colour: string
  size?: string
  qty: number
}

/** Validates cart lines against the catalog. Prices always come from the server, never the browser. */
function toLineItems(body: unknown, byId: Map<string, Product>): Stripe.Checkout.SessionCreateParams.LineItem[] {
  const items = (body as { items?: unknown })?.items
  if (!Array.isArray(items) || items.length === 0) throw new HttpError(400, 'Your cart is empty.')
  if (items.length > 50) throw new HttpError(400, 'Too many lines in the cart.')
  return items.map((raw: RequestLine) => {
    const p = byId.get(raw?.productId)
    if (!p) throw new HttpError(400, 'A product in your cart is no longer available.')
    if (!lineMatchesCatalog(raw, byId)) throw new HttpError(400, `${p.name}: that colour or size is not available.`)
    const qty = Math.floor(Number(raw.qty))
    if (!(qty >= 1 && qty <= MAX_QTY)) throw new HttpError(400, `${p.name}: quantity must be 1–${MAX_QTY}.`)
    const options = [p.colours.length > 1 ? raw.colour : null, raw.size].filter(Boolean).join(' · ')
    return {
      quantity: qty,
      price_data: {
        currency: 'inr',
        unit_amount: p.price * 100, // paise
        product_data: { name: p.name, ...(options ? { description: options } : {}), metadata: { productId: p.id } },
      },
    }
  })
}

/** Creates a Stripe Checkout session and returns its hosted payment page URL. */
export async function createCheckout(body: unknown, origin: string, authorization?: string | string[]) {
  const [{ byId }, user] = await Promise.all([loadCatalog(), userFromHeader(authorization)])
  const session = await stripe().checkout.sessions.create({
    mode: 'payment',
    line_items: toLineItems(body, byId),
    ...(user ? { client_reference_id: user.id, metadata: { user_id: user.id }, ...(user.email ? { customer_email: user.email } : {}) } : {}),
    shipping_address_collection: { allowed_countries: ['IN'] },
    success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/?checkout=cancelled`,
  })
  if (!session.url) throw new HttpError(502, 'Stripe did not return a checkout page.')
  return { url: session.url }
}

/** Looks up a finished checkout so the success screen can show a receipt. */
export async function getOrder(sessionId: unknown) {
  if (typeof sessionId !== 'string' || !/^cs_test_[A-Za-z0-9]+$/.test(sessionId)) throw new HttpError(400, 'Invalid order reference.')
  const s = stripe()
  const session = await s.checkout.sessions.retrieve(sessionId)
  const lines = await s.checkout.sessions.listLineItems(sessionId, { limit: 100 })
  const order = {
    id: session.id,
    paid: session.payment_status === 'paid',
    total: (session.amount_total ?? 0) / 100,
    email: session.customer_details?.email ?? null,
    items: lines.data.map((l) => ({ name: l.description ?? '', qty: l.quantity ?? 0, amount: l.amount_total / 100 })),
  }
  return { ...order, saved: order.paid ? await saveOrder(session, order) : false }
}

/** Saves the order for a completed checkout session. Used by the Stripe webhook. */
export async function saveOrderForSession(sessionId: string) {
  const s = stripe()
  const session = await s.checkout.sessions.retrieve(sessionId)
  if (session.payment_status !== 'paid') return false
  const lines = await s.checkout.sessions.listLineItems(sessionId, { limit: 100 })
  return saveOrder(session, {
    email: session.customer_details?.email ?? null,
    total: (session.amount_total ?? 0) / 100,
    items: lines.data.map((l) => ({ name: l.description ?? '', qty: l.quantity ?? 0, amount: l.amount_total / 100 })),
  })
}

/** Verifies a Stripe webhook signature and returns the event. */
export function verifyWebhook(rawBody: Buffer, signature: string | string[] | undefined) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) throw new HttpError(503, 'Webhook is not set up: STRIPE_WEBHOOK_SECRET is missing.')
  if (typeof signature !== 'string') throw new HttpError(400, 'Missing Stripe signature.')
  try {
    return stripe().webhooks.constructEvent(rawBody, signature, secret)
  } catch {
    throw new HttpError(400, 'Invalid Stripe signature.')
  }
}

/**
 * Records a paid order in Supabase. Upserting on the Stripe session id means
 * reloading the confirmation page never creates a duplicate.
 */
async function saveOrder(session: Stripe.Checkout.Session, order: { email: string | null; total: number; items: unknown[] }) {
  const db = supabaseAdmin()
  if (!db) return false
  const shipping = session.collected_information?.shipping_details ?? null
  const { error } = await db.from('orders').upsert(
    {
      stripe_session_id: session.id,
      user_id: session.metadata?.user_id || null,
      email: order.email,
      total: order.total,
      status: session.payment_status,
      items: order.items,
      shipping,
    },
    // The first write wins; reloading the receipt or a repeated webhook never rewrites it.
    { onConflict: 'stripe_session_id', ignoreDuplicates: true },
  )
  if (error) console.error('Could not save order', session.id, error.message)
  return !error
}
