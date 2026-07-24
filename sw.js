// A simple service worker to satisfy PWA requirements
self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
});

self.addEventListener('fetch', (e) => {
  // We do not intercept fetches. This is just to satisfy the PWA installability check.
});
