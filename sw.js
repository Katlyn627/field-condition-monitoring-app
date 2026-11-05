const CACHE_NAME = 'trailtracker-v5';
const ASSETS = ['./', './index.html?v=5', './styles.css?v=5', './app.js?v=5', './manifest.json?v=5'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        // Fetch each asset with cache-busting params, then store under canonical URL
        return Promise.all(
          ASSETS.map((url) => {
            return fetch(url)
              .then((response) => {
                if (!response || response.status !== 200) {
                  throw new Error(`Failed to fetch ${url}`);
                }
                // Store under canonical URL (without query param)
                const canonicalUrl = url.split('?')[0];
                return cache.put(canonicalUrl, response);
              });
          })
        );
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && event.request.url.startsWith(self.location.origin)) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
