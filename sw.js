const CACHE_NAME = 'houdini-hemps-v1';

const STATIC_FILES = [
  '/',
  '/index.html',
  '/customer-login.html',
  '/admin-login.html',
  '/customer-dashboard.html',
  '/admin-dashboard.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// Install — cache all static files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_FILES);
    })
  );
  self.skipWaiting();
});

// Activate — delete old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch — network first, fallback to cache
self.addEventListener('fetch', event => {
  // Skip Supabase API calls — always fetch live
  if (event.request.url.includes('supabase.co')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Save fresh copy to cache
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => {
        // Offline fallback — serve from cache
        return caches.match(event.request);
      })
  );
});