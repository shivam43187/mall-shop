import { existsSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { join } from 'node:path'
import type { Plugin, ViteDevServer } from 'vite'

/**
 * Serves the same /api routes as Vercel while running `npm run dev`, so checkout works locally.
 * Server code is loaded through Vite, so edits apply without restarting.
 */
export function devApi(): Plugin {
  return {
    name: 'mall-shop-dev-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://localhost')
        if (!url.pathname.startsWith('/api/')) return next()
        const route = url.pathname.slice('/api/'.length)
        if (!/^[a-z-]+$/.test(route) || !existsSync(join(server.config.root, 'api', `${route}.ts`))) {
          return send(res, 404, { error: 'Not found' })
        }
        const mod = (await server.ssrLoadModule(`/api/${route}.ts`)) as { default: (req: unknown, res: unknown) => Promise<unknown> }
        const body = req.method === 'POST' ? await readJson(req) : undefined
        await mod.default(
          { method: req.method, headers: req.headers, query: Object.fromEntries(url.searchParams), body },
          vercelLikeResponse(res),
        )
      })
    },
  }
}

function send(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

function vercelLikeResponse(res: ServerResponse) {
  const r = {
    status(code: number) {
      res.statusCode = code
      return r
    },
    json(data: unknown) {
      send(res, res.statusCode, data)
      return r
    },
  }
  return r
}

async function readJson(req: IncomingMessage) {
  const chunks: Buffer[] = []
  let size = 0
  for await (const c of req) {
    size += (c as Buffer).length
    if (size > 100_000) return undefined
    chunks.push(c as Buffer)
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    return undefined
  }
}
