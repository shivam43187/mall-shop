import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages serves the site from /mall-shop/, local dev from /.
export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/mall-shop/' : '/',
  plugins: [react()],
})
