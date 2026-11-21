import type { IncomingMessage } from 'node:http'
import { HttpError, saveOrderForSession, verifyWebhook } from '../server/checkout'
import type { ApiResponse } from '../server/http'

/**
 * POST /api/stripe-webhook — Stripe calls this when a payment completes, so orders are saved
 * even if the shopper closes the tab before returning to the site.
 * Set STRIPE_WEBHOOK_SECRET and subscribe to checkout.session.completed and
 * checkout.session.async_payment_succeeded in the Stripe dashboard (or `stripe listen` locally).
 */
export default async function handler(req: IncomingMessage & { rawBody?: Buffer }, res: ApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' })
  try {
    const event = verifyWebhook(req.rawBody ?? (await readRaw(req)), req.headers['stripe-signature'])
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      await saveOrderForSession(event.data.object.id)
    }
    res.status(200).json({ received: true })
  } catch (e) {
    const status = e instanceof HttpError ? e.status : 500
    if (status === 500) console.error(e)
    res.status(status).json({ error: status === 500 ? 'Webhook failed.' : (e as Error).message })
  }
}

async function readRaw(req: IncomingMessage) {
  const chunks: Buffer[] = []
  for await (const c of req) chunks.push(c as Buffer)
  return Buffer.concat(chunks)
}

// Vercel: give the handler the raw body, which Stripe's signature check needs.
export const config = { api: { bodyParser: false } }
