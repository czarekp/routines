const CACHE_NAME = "routines-v4";
const APP_SHELL = ["/routines/", "/routines/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

// Navigations go to the network first so a fresh deploy is picked up on the next
// launch; the cache is only the offline fallback. Everything else (Next.js emits
// content-hashed asset URLs) can safely be served cache-first.
function networkFirst(request) {
  return fetch(request)
    .then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches
          .open(CACHE_NAME)
          .then((cache) => cache.put(request, copy))
          .catch(() => undefined);
      }
      return response;
    })
    .catch(() =>
      caches
        .match(request)
        .then((cached) => cached || caches.match("/routines/")),
    );
}

function cacheFirst(request) {
  return caches.match(request).then(
    (cached) =>
      cached ||
      fetch(request).then((response) => {
        if (!response.ok) return response;
        const copy = response.clone();
        caches
          .open(CACHE_NAME)
          .then((cache) => cache.put(request, copy))
          .catch(() => undefined);
        return response;
      }),
  );
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.protocol !== "http:" && requestUrl.protocol !== "https:")
    return;

  event.respondWith(
    event.request.mode === "navigate"
      ? networkFirst(event.request)
      : cacheFirst(event.request),
  );
});

// The settings screen asks the waiting worker to take over immediately.
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
