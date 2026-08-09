import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/react-laboratory/',
  resolve: {
    // candle-core is consumed from GitHub source (dist may be absent).
    // Point the package entry at its TypeScript source for Vite.
    alias: {
      'candle-core': path.resolve(__dirname, 'node_modules/candle-core/src/index.ts'),
    },
  },
  optimizeDeps: {
    exclude: ['candle-core'],
  },
})
