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
    alias: {
      // Prefer vendored TypeScript sources (CI / local sync).
      'candle-core': path.resolve(__dirname, 'vendor/candle-core/src/index.ts'),
    },
  },
  optimizeDeps: {
    exclude: ['candle-core'],
  },
})
