import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  // Use the repo path only for production builds published to GitHub Pages.
  base: command === 'build' ? '/jamming/' : '/',
  plugins: [react()],
  server: { host: '127.0.0.1', port: 3000, open: 'http://127.0.0.1:3000/' },
}))
