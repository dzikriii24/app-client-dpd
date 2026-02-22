import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'


export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA({
      strategies: 'injectManifest', // Ubah ke injectManifest untuk Custom SW
      srcDir: 'src',                // Lokasi file sw.js
      filename: 'sw.js',            // Nama file sw.js
      registerType: 'autoUpdate', 
      includeAssets: ['logodpd/favicon.ico', 'logodpd/apple-touch-icon.png', 'logodpd/mask-icon.svg'],
      manifest: {
        name: 'Portal Absensi Petugas',
        short_name: 'Absensi',
        description: 'Aplikasi Absensi Petugas Keamanan',
        theme_color: '#dc2626',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'logodpd/android-chrome-192x192.png', // Mengarah ke folder logodpd
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logodpd/android-chrome-512x512.png', // Mengarah ke folder logodpd
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })],
})
