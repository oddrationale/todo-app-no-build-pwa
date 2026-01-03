/// <reference lib="webworker" />

const CACHE_NAME = "todo-app-v3";

// Local assets to cache
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  // Source files
  "./src/main.js",
  "./src/components/todo-app.js",
  "./src/components/todo-item.js",
  "./src/components/todo-composer.js",
  "./src/components/todo-list.js",
  "./src/state/todo.js",
  "./src/utils/storage.js",
  // Icons
  "./public/icons/favicon.ico",
  "./public/icons/favicon.svg",
  "./public/icons/favicon-96x96.png",
  "./public/icons/apple-touch-icon.png",
  "./public/icons/web-app-manifest-192x192.png",
  "./public/icons/web-app-manifest-512x512.png",
];

// CDN dependencies to cache for offline use
const CDN_ASSETS_TO_CACHE = [
  "https://cdn.jsdelivr.net/npm/daisyui@5",
  "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4",
  "https://esm.sh/lit@3.3.2",
  "https://esm.sh/@lit-labs/signals@0.2.0",
];

// Install event - cache the app shell
self.addEventListener("install", (/** @type {ExtendableEvent} */ event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Cache local assets first
      await cache.addAll(ASSETS_TO_CACHE);

      // Cache CDN assets (these may fail in some environments, so we handle errors gracefully)
      const cdnCachePromises = CDN_ASSETS_TO_CACHE.map(async (url) => {
        try {
          const response = await fetch(url, {
            mode: "cors",
            credentials: "omit",
          });
          if (response.ok) {
            await cache.put(url, response);
          }
        } catch (error) {
          console.warn(`Failed to cache CDN asset: ${url}`, error);
        }
      });
      await Promise.all(cdnCachePromises);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up outdated caches
self.addEventListener("activate", (/** @type {ExtendableEvent} */ event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
  );
  self.clients.claim();
});

// Fetch event - return cached response when available (stale-while-revalidate)
self.addEventListener("fetch", (/** @type {FetchEvent} */ event) => {
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);

  // For CDN resources, use cache-first with network fallback
  const isCdnRequest = requestUrl.origin !== location.origin;

  if (isCdnRequest) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached version, update in background
          event.waitUntil(
            fetch(event.request, { mode: "cors", credentials: "omit" })
              .then((networkResponse) => {
                if (networkResponse.ok) {
                  caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                  });
                }
              })
              .catch(() => {})
          );
          return cachedResponse;
        }
        // Not in cache, fetch from network
        return fetch(event.request, { mode: "cors", credentials: "omit" }).then(
          (networkResponse) => {
            if (networkResponse.ok) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
              });
            }
            return networkResponse;
          }
        );
      })
    );
    return;
  }

  // For local resources, use stale-while-revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        event.waitUntil(
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse.ok) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, networkResponse.clone());
                });
              }
            })
            .catch(() => {})
        );
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (networkResponse.ok) {
          const responseClone = networkResponse.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      });
    })
  );
});
