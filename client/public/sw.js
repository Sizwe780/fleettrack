const CACHE_NAME = 'fleettrack-cache-v3.5';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/offline.html',
  '/create-trip',
  '/dashboard',
  '/compliance-archive'
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
  if (request.url.includes('/trips') || request.url.includes('/api/')) {
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
  const title = data.title || 'FleetTrack Alert';
  const body = data.body || 'You have a new fleet notification.';

  // 🧠 Log push payload to audit trail (if supported)
  fetch('/api/log-push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, body, timestamp: new Date().toISOString() })
  }).catch(err => console.warn('Push log failed:', err));

  self.registration.showNotification(title, {
    body,
    icon: '/logo192.png'
  });
});