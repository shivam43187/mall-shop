import Stripe from 'stripe'
import { productById } from '../src/data/products'
import { MAX_QTY } from '../src/lib/limits'

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
function toLineItems(body: unknown): Stripe.Checkout.SessionCreateParams.LineItem[] {
  const items = (body as { items?: unknown })?.items
  if (!Array.isArray(items) || items.length === 0) throw new HttpError(400, 'Your cart is empty.')
  if (items.length > 50) throw new HttpError(400, 'Too many lines in the cart.')
  return items.map((raw: RequestLine) => {
    const p = productById.get(raw?.productId)
    if (!p) throw new HttpError(400, 'A product in your cart is no longer available.')
    if (!p.colours.some((c) => c.name === raw.colour)) throw new HttpError(400, `${p.name}: that colour is not available.`)
    if (p.sizes ? !p.sizes.includes(raw.size ?? '') : raw.size !== undefined) throw new HttpError(400, `${p.name}: please choose a valid size.`)
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
export async function createCheckout(body: unknown, origin: string) {
  const session = await stripe().checkout.sessions.create({
    mode: 'payment',
    line_items: toLineItems(body),
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
  return {
    id: session.id,
    paid: session.payment_status === 'paid',
    total: (session.amount_total ?? 0) / 100,
    email: session.customer_details?.email ?? null,
    items: lines.data.map((l) => ({ name: l.description, qty: l.quantity ?? 0, amount: l.amount_total / 100 })),
  }
}
