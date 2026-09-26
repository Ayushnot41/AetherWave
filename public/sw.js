/**
 * AetherWave Service Worker
 *
 * Strategy:
 * - Cache-first for app shell (HTML, CSS, JS, fonts, icons)
 * - Network-first for API data (risk data, verification status)
 * - Stale-while-revalidate for images
 * - Offline fallback page for navigation requests
 *
 * Push:
 * - Handles 'push' events for disaster notifications
 * - On notificationclick, opens /alert-enrollment
 */

// ─── Push Notification Handler ────────────────────────────────────────────────

self.addEventListener('push', (event) => {
  let data = { title: '🚨 AetherWave — आपदा चेतावनी', body: 'A disaster risk has been detected. Open AetherWave for details. / आपके क्षेत्र में आपदा जोखिम।' };
  try {
    if (event.data) {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    }
  } catch (_) { /* ignore */ }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'aw-disaster-alert',
      requireInteraction: true,
      data: { url: '/alert-enrollment' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/alert-enrollment';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus().then(() => client.navigate(url));
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});

const CACHE_NAME = 'aetherweave-v1';
const STATIC_ASSETS = ['/', '/manifest.json', '/offline'];

const API_CACHE_NAME = 'aetherweave-api-v1';
const IMAGE_CACHE_NAME = 'aetherweave-images-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  void self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter(
            (name) =>
              name !== CACHE_NAME &&
              name !== API_CACHE_NAME &&
              name !== IMAGE_CACHE_NAME
          )
          .map((name) => caches.delete(name))
      )
    )
  );
  void self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  // API requests: network-first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, API_CACHE_NAME));
    return;
  }

  // Image requests: stale-while-revalidate
  if (
    request.destination === 'image' ||
    url.pathname.match(/\.(png|jpg|jpeg|webp|svg|gif|ico)$/i)
  ) {
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE_NAME));
    return;
  }

  // Navigation requests: cache-first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(navigationHandler(request));
    return;
  }

  // All other static assets: cache-first
  event.respondWith(cacheFirst(request, CACHE_NAME));
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      void cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      void cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(
      JSON.stringify({
        code: 'OFFLINE',
        message: 'You are offline',
        retryable: true,
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        void cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached ?? new Response('', { status: 503 }));

  return cached ?? fetchPromise;
}

async function navigationHandler(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      void cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    const offlinePage = await caches.match('/offline');
    if (offlinePage) return offlinePage;

    return new Response(
      '<html><body><h1>You are offline</h1><p>Please reconnect to continue.</p></body></html>',
      { status: 503, headers: { 'Content-Type': 'text/html' } }
    );
  }
}
