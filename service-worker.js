const CACHE_NAME = "tarot-tdw-v2";

const APP_SHELL = [
  "./",
  "./index.html",
  "./styles/main.css",
  "./manifest.json",
  "./src/main.js",
  "./src/ui/screens/home-screen.js",
  "./src/ui/screens/reading-screen.js",
  "./src/ui/components/tarot-card.js",
  "./src/ui/components/card-meaning-overlay.js",
  "./src/features/readings/create-reading.js",
  "./src/features/decks/deck-service.js",
  "./src/features/settings/settings-repo.js",
  "./src/features/history/history-repo.js",
  "./src/features/spreads/spread-service.js",
  "./src/core/random.js",
  "./src/core/validators.js",
  "./src/core/meaning-resolver.js",
  "./src/core/reading-engine.js",
  "./src/data/hints.json",
  "./src/data/spreads.json",
  "./src/data/decks/rider-waite/meta.json",
  "./src/data/decks/rider-waite/cards.json",
  "./assets/icons/111.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => key !== CACHE_NAME)
        .map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isCardAsset = url.pathname.startsWith("/assets/images/");
  if (isCardAsset) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  const cache = await caches.open(CACHE_NAME);
  cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const networkPromise = fetch(request)
    .then((response) => {
      cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);

  if (cached) return cached;

  const networkResponse = await networkPromise;
  if (networkResponse) return networkResponse;

  if (request.mode === "navigate") {
    return cache.match("./index.html");
  }

  return new Response("Offline", {
    status: 503,
    headers: { "Content-Type": "text/plain; charset=utf-8" }
  });
}
