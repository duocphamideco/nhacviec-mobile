const scope = new URL(self.registration.scope);
const cachePrefix = 'ideco-livevoice-' + scope.pathname + '-';
const cacheName = cachePrefix + 'v2.2.0';
const assets = [
  'offline.html', 'icon-192.png', 'icon-512.png',
  'icon-maskable-192.png', 'icon-maskable-512.png',
  'apple-touch-icon.png', 'favicon-48.png'
].map(path => new URL(path, scope).href);

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    // A missing optional asset should not block registration.
    await Promise.allSettled(assets.map(url => cache.add(url)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => key.startsWith(cachePrefix) && key !== cacheName)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET' || !request.url.startsWith(scope.href)) return;
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        return await fetch(request);
      } catch {
        const cache = await caches.open(cacheName);
        return await cache.match(new URL('offline.html', scope).href) ||
          new Response('LiveVoice cần Internet. Vui lòng kết nối rồi mở lại.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
      }
    })());
  } else if (assets.includes(request.url)) {
    event.respondWith((async () => {
      const cache = await caches.open(cacheName);
      return await cache.match(request) || fetch(request);
    })());
  }
});
