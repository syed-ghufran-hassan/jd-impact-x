import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Fix for some wallet libraries
    global: 'globalThis',
  },
  resolve: {
    alias: {
      // Polyfills for Node.js modules used by some crypto libraries
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    include: ['buffer'],
  },
})
