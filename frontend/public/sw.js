const CACHE_NAME = "nexspend-v2"
const STATIC_ASSETS = ["/", "/index.html", "/manifest.json"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key)
          }
        })
      )
    })
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url)

  // Ignore non-GET requests
  if (event.request.method !== "GET") return

  // NetworkFirst strategy for API calls
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const cloned = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned))
          return response
        })
        .catch(() => caches.match(event.request))
    )
    return
  }

  // NetworkFirst / Fallback strategy for Navigation (HTML requests)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match("/index.html") || caches.match("/")
      })
    )
    return
  }

  // CacheFirst strategy for static assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse
      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cloned = networkResponse.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned))
          }
          return networkResponse
        })
        .catch(() => {
          return caches.match("/index.html")
        })
    })
  )
})
