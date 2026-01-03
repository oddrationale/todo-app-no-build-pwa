/// <reference lib="webworker" />

const CACHE_NAME = "todo-app-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/src/main.js",
  "/src/app.js",
  "/manifest.json",
  "/public/icons/favicon.ico",
  "/public/icons/favicon.svg",
  "/public/icons/favicon-96x96.png",
  "/public/icons/apple-touch-icon.png",
];

// Install event - cache the app shell
self.addEventListener("install", (/** @type {ExtendableEvent} */ event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
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

// Fetch event - return cached response when available
self.addEventListener("fetch", (/** @type {FetchEvent} */ event) => {
  if (event.request.method !== "GET") return;

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
