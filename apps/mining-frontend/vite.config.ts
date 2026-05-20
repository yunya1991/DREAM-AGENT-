import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@marketplace': path.resolve(__dirname, '../../modules-marketplace'),
    },
    dedupe: ['react', 'react-dom', 'lucide-react'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'],
  },
  server: {
    port: 5174,
    proxy: {
      '/artifacts': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/artifacts/, '/api/artifacts'),
      },
    },
  },
})
