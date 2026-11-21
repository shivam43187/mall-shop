import type { ApiRequest, ApiResponse } from '../server/http'
import { HttpError, createCheckout } from '../server/checkout'
import { originOf } from '../server/origin'

/** POST /api/checkout — body: { items: [{ productId, colour, size?, qty }] } → { url } */
export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' })
  try {
    res.status(200).json(await createCheckout(req.body, originOf(req.headers), req.headers.authorization))
  } catch (e) {
    const status = e instanceof HttpError ? e.status : 500
    if (status === 500) console.error(e)
    res.status(status).json({ error: status === 500 ? 'Could not start checkout. Please try again.' : (e as Error).message })
  }
}
