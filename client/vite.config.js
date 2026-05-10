import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    chunkSizeWarningLimit: 1600,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://blog-backend-mueu.onrender.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      },
    },
  },
})