// c:\Users\dzikri\Downloads\absensi-app-user\client\src\sw.js

import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'

// 1. Standard PWA Caching (Biar bisa offline)
cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)
self.skipWaiting()
clientsClaim()

// 2. Event Listener: SAAT MENERIMA NOTIFIKASI DARI SERVER
self.addEventListener('push', (event) => {
  const data = event.data.json()
  
  console.log('Push Received:', data);

  const options = {
    body: data.body,
    icon: '/logodpd/android-chrome-192x192.png', // Logo Besar
    badge: '/logodpd/android-chrome-192x192.png', // Logo Kecil di Status Bar (Harus transparan/putih idealnya, tapi png oke)
    vibrate: [100, 50, 100], // Getar: Bzz-bz-Bzz
    data: {
      url: data.url || '/'
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// 3. Event Listener: SAAT NOTIFIKASI DIKLIK
self.addEventListener('notificationclick', (event) => {
  event.notification.close() // Tutup notif

  // Buka aplikasi ke halaman tujuan
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // Jika aplikasi sudah terbuka, focus ke situ
      for (let client of windowClients) {
        if (client.url.includes(event.notification.data.url) && 'focus' in client) {
          return client.focus()
        }
      }
      // Jika belum terbuka, buka window baru
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url)
      }
    })
  )
})
