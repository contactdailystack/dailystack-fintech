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
        theme_color: '#1c232a',
        background_color: '#1c232a',
        display: 'standalone',
        icons: [
          {
            src: '/assets/logos/pwa-192x192.png', // ปรับ Path ให้ถูกต้อง
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/assets/logos/pwa-512x512.png', // ปรับ Path ให้ถูกต้อง
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})