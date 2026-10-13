// Bump this whenever the caching strategy changes so old caches get purged.
const CACHE_NAME = 'rentzypro-v3';
const OFFLINE_URLS = ['/', '/offline'];

// Static assets under /_next/static are content-hashed, so they are safe to
// serve from cache forever. Everything else must hit the network first,
// otherwise users get a stale HTML document pointing at stale JS chunks
// (old UI + hydration mismatches).
const isImmutableAsset = (url) =>
  url.pathname.startsWith('/_next/static/') ||
  url.pathname.startsWith('/_next/image') ||
  /\.(?:css|js|woff2?|ttf|eot|svg|png|jpg|jpeg|gif|webp|avif|ico)$/i.test(url.pathname);

const isHtmlRequest = (request) =>
  request.mode === 'navigate' ||
  (request.headers.get('accept') || '').includes('text/html');

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(OFFLINE_URLS))
      .catch(() => {})
      .then(() => self.skipWaiting())
  );
});

// Take over immediately so a new SW doesn't sit waiting for all tabs to close.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

// Network-first, falling back to cache only when the network is unavailable.
const networkFirst = async (request) => {
  try {
    const response = await fetch(request);
    if (response && response.status === 200 && response.type === 'basic') {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (isHtmlRequest(request)) {
      const offline = await caches.match('/offline');
      if (offline) return offline;
    }
    return Response.error();
  }
};

// Cache-first, safe only for content-hashed immutable assets.
const cacheFirst = async (request) => {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.status === 200 && response.type === 'basic') {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return Response.error();
  }
};

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle same-origin GETs. Never touch API calls or cross-origin
  // requests (Cloudinary images, auth endpoints, etc.).
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;
  if (/^\/(admin|seller|add|profile|wishlist|alerts|chat|notifications|login|register|verify-otp|reset-password)(\/|$)/.test(url.pathname)) return;

  if (isHtmlRequest(request)) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isImmutableAsset(url)) {
    event.respondWith(cacheFirst(request));
  }
  // Anything else falls through to the network untouched.
});
