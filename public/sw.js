// Minimal service worker for installability. It intentionally does no
// caching so app updates always come straight from the network.
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})
