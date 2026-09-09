import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Ruta base: el sitio vive en https://danieljulio-sudo.github.io/App-Web-bitacora-regenerativa/
const BASE = '/App-Web-bitacora-regenerativa/'

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    // Convierte la app en instalable y la deja funcionar sin señal.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Bitácora Regenerativa',
        short_name: 'Bitácora',
        description: 'Registra las señales de regeneración que ves durante el recorrido.',
        lang: 'es',
        start_url: BASE,
        scope: BASE,
        display: 'standalone',
        background_color: '#EEF0EA',
        theme_color: '#2F6B3A',
        icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
      workbox: {
        navigateFallback: BASE + 'index.html',
        navigateFallbackDenylist: [/\/demo\//],
        runtimeCaching: [
          { urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i, handler: 'StaleWhileRevalidate', options: { cacheName: 'google-fonts-css' } },
          { urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i, handler: 'CacheFirst', options: { cacheName: 'google-fonts-files', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 } } },
        ],
      },
    }),
  ],
})
