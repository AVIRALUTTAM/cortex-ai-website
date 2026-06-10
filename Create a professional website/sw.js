const CACHE_NAME = 'cortex-ai-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/services.html',
  '/ai-training.html',
  '/about.html',
  '/careers.html',
  '/blog.html',
  '/pricing.html',
  '/contact.html',
  '/styles.css',
  '/script.js',
  '/_nav.js',
  '/manifest.json',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  /* Cache-first for static assets, network-first for Firebase/API calls */
  const url = new URL(event.request.url);
  const isFirebase = url.hostname.includes('firebaseapp.com') ||
                     url.hostname.includes('googleapis.com') ||
                     url.hostname.includes('gstatic.com');

  if (isFirebase) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
