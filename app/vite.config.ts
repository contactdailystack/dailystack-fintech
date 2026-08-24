import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Animation libraries
          'vendor-motion': ['motion/react'],
          // Icons
          'vendor-icons': ['lucide-react'],
          // Supabase
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
    // Increase warning limit since we're being more aggressive
    chunkSizeWarningLimit: 400,
  },
})
