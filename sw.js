const PREFIX = 'ideco-livevoice-' + new URL(self.registration.scope).pathname + '-';
const CACHE = PREFIX + 'v2.1.0';
const ASSETS = ['offline.html','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png','icons/favicon.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)))));
});
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;
  // Firebase and AI requests are never stored in this cache.
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(new URL('offline.html',self.registration.scope).href)));
  } else if (ASSETS.some(path => url.href === new URL(path,self.registration.scope).href)) {
    event.respondWith(caches.match(request).then(cached => cached || fetch(request)));
  }
});
