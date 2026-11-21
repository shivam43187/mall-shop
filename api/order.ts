import type { ApiRequest, ApiResponse } from '../server/http'
import { HttpError, getOrder } from '../server/checkout'

/** GET /api/order?session_id=cs_test_… → order summary for the success screen. */
export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Use GET.' })
  try {
    res.status(200).json(await getOrder(req.query.session_id))
  } catch (e) {
    const status = e instanceof HttpError ? e.status : 500
    if (status === 500) console.error(e)
    res.status(status).json({ error: status === 500 ? 'Could not load your order.' : (e as Error).message })
  }
}
