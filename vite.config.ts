import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { devApi } from './server/devApi.ts'

export default defineConfig(({ mode }) => {
  // Make server-only secrets from .env.local (e.g. STRIPE_SECRET_KEY) visible to the local /api routes.
  // Only variables starting with VITE_ are ever sent to the browser.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))
  return {
    plugins: [react(), devApi()],
  }
})
