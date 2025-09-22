const CACHE_NAME = 'fleettrack-cache-v3';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/offline.html',
  '/create-trip',
  '/dashboard'
];

// 🔒 Pre-cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// 🧹 Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// 🔁 Fetch handler
self.addEventListener('fetch', event => {
  const { request } = event;

  // 🚚 API requests (network-first)
  if (request.url.includes('/trips')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, cloned));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // 🧭 Navigation requests (offline fallback)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/offline.html'))
    );
    return;
  }

  // 📦 Static assets (cache-first)
  event.respondWith(
    caches.match(request).then(response => response || fetch(request))
  );
});

// 🔔 Push notification handler
self.addEventListener('push', event => {
  const data = event.data?.json() || {};
  self.registration.showNotification(data.title || 'FleetTrack Alert', {
    body: data.body || 'You have a new fleet notification.',
    icon: '/logo192.png'
  });
});