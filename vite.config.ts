import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'DailyStack',
        short_name: 'DailyStack',
        description: 'Your Daily Lifestyle Membership Stack',
        theme_color: '#e9e9e9',
        background_color: '#e9e9e9',
        display: 'standalone',
        icons: [
          {
            src: '/assets/logos/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/assets/logos/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@supabase') || id.includes('websocket')) {
              return 'supabase';
            }
            if (id.includes('react')) {
              return 'react-core';
            }
            return 'vendor';
          }
        }
      }
    }
  }
})