import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  worker: {
    format: 'es',
  },
  optimizeDeps: {
    include: ['@xenova/transformers'],
    entries: ['./src/workers/embeddings.worker.ts'],
  },
  server: {
    warmup: {
      clientFiles: ['./src/workers/embeddings.worker.ts'],
    },
  },
})
