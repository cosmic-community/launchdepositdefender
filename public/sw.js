const CACHE_NAME = 'depositdefender-v1'
const urlsToCache = [
  '/',
  '/manifest.json',
  '/offline.html'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response
        }
        return fetch(event.request)
      })
      .catch(() => {
        if (event.request.destination === 'document') {
          return caches.match('/offline.html')
        }
      })
  )
})