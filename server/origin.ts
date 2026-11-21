import type { IncomingHttpHeaders } from 'node:http'

/**
 * The site's own URL, used for Stripe's return links.
 * SITE_URL wins when set (recommended in production); otherwise it comes from the request's Host header.
 */
export function originOf(headers: IncomingHttpHeaders) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '')
  const host = headers['x-forwarded-host'] ?? headers.host ?? 'localhost:5173'
  const proto = headers['x-forwarded-proto'] ?? (String(host).startsWith('localhost') ? 'http' : 'https')
  return `${proto}://${host}`
}
