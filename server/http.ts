import type { IncomingHttpHeaders } from 'node:http'

/** The parts of Vercel's request/response objects our /api routes use (avoids the heavy @vercel/node package). */
export interface ApiRequest {
  method?: string
  headers: IncomingHttpHeaders
  query: Record<string, string | string[] | undefined>
  body?: unknown
}

export interface ApiResponse {
  status(code: number): ApiResponse
  json(data: unknown): ApiResponse
}
