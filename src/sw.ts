/// <reference lib="webworker" />

// Source for the built service worker (public/sw.js under Next.js). vite-plugin-pwa's
// injectManifest strategy compiles this file and substitutes `self.__WB_MANIFEST`
// with the list of content-hashed build assets, which we then precache ourselves —
// everything past that point is unchanged from the previous hand-written worker.

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null } | string>;
};

const CACHE_NAME = "routines-v5";
const APP_SHELL = ["/routines/", "/routines/manifest.json"];
const PRECACHE_URLS = self.__WB_MANIFEST.map((entry) =>
  typeof entry === "string" ? entry : entry.url,
);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll([...APP_SHELL, ...PRECACHE_URLS])),
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
// launch; the cache is only the offline fallback. Everything else (Vite emits
// content-hashed asset URLs) can safely be served cache-first.
function networkFirst(request: Request): Promise<Response> {
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
    .catch(
      () =>
        caches
          .match(request)
          .then(
            (cached) => cached || caches.match("/routines/"),
          ) as Promise<Response>,
    );
}

function cacheFirst(request: Request): Promise<Response> {
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
