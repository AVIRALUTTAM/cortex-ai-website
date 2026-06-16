const CACHE_NAME = 'cortex-ai-v4';
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
  '/case-studies.html',
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
  const url = new URL(event.request.url);

  /* Always go to network for: Firebase, external APIs, navigation requests */
  const isExternal = url.hostname.includes('firebaseapp.com') ||
                     url.hostname.includes('googleapis.com') ||
                     url.hostname.includes('gstatic.com') ||
                     url.hostname.includes('unpkg.com');

  /* Let browser handle all page navigations directly — no SW interception */
  if (event.request.mode === 'navigate' || isExternal) {
    event.respondWith(fetch(event.request));
    return;
  }

  /* Cache-first for static assets (CSS, JS, fonts, images) */
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
