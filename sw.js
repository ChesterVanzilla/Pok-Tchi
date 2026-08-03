const VERSION = 'tamapoke-family-v06c-20260726';
const CORE = [
  './',
  './index.html',
  './styles.css',
  './manifest.webmanifest',
  './js/app.js',
  './js/storage.js',
  './js/sprite-engine.js',
  './js/game-engine.js',
  './js/worlds.js',
  './data/species.json',
  './assets/worlds/forest-day.svg',
  './assets/worlds/forest-night.svg',
  './assets/worlds/volcano-day.svg',
  './assets/worlds/volcano-night.svg',
  './assets/worlds/lagoon-day.svg',
  './assets/worlds/lagoon-night.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/ui/apple.png',
  './assets/ui/arrow.png',
  './assets/ui/ball.png',
  './assets/ui/book.png',
  './assets/ui/brush.png',
  './assets/ui/bubbles.png',
  './assets/ui/camera.png',
  './assets/ui/coin.png',
  './assets/ui/dumbbell.png',
  './assets/ui/egg.png',
  './assets/ui/friends.png',
  './assets/ui/gear.png',
  './assets/ui/gem.png',
  './assets/ui/heart.png',
  './assets/ui/home.png',
  './assets/ui/leaf.png',
  './assets/ui/moon.png',
  './assets/ui/shop.png',
  './assets/ui/star.png',
  './assets/ui/trophy.png',
  './assets/ui/world.png',
  './assets/worlds/all/bug-day.svg',
  './assets/worlds/all/bug-night.svg',
  './assets/worlds/all/dark-day.svg',
  './assets/worlds/all/dark-night.svg',
  './assets/worlds/all/dragon-day.svg',
  './assets/worlds/all/dragon-night.svg',
  './assets/worlds/all/electric-day.svg',
  './assets/worlds/all/electric-night.svg',
  './assets/worlds/all/fairy-day.svg',
  './assets/worlds/all/fairy-night.svg',
  './assets/worlds/all/fighting-day.svg',
  './assets/worlds/all/fighting-night.svg',
  './assets/worlds/all/fire-day.svg',
  './assets/worlds/all/fire-night.svg',
  './assets/worlds/all/flying-day.svg',
  './assets/worlds/all/flying-night.svg',
  './assets/worlds/all/ghost-day.svg',
  './assets/worlds/all/ghost-night.svg',
  './assets/worlds/all/ground-day.svg',
  './assets/worlds/all/ground-night.svg',
  './assets/worlds/all/ice-day.svg',
  './assets/worlds/all/ice-night.svg',
  './assets/worlds/all/normal-day.svg',
  './assets/worlds/all/normal-night.svg',
  './assets/worlds/all/plant-day.svg',
  './assets/worlds/all/plant-night.svg',
  './assets/worlds/all/poison-day.svg',
  './assets/worlds/all/poison-night.svg',
  './assets/worlds/all/psychic-day.svg',
  './assets/worlds/all/psychic-night.svg',
  './assets/worlds/all/rock-day.svg',
  './assets/worlds/all/rock-night.svg',
  './assets/worlds/all/steel-day.svg',
  './assets/worlds/all/steel-night.svg',
  './assets/worlds/all/water-day.svg',
  './assets/worlds/all/water-night.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(VERSION).then((cache) => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(VERSION).then((cache) => cache.put(event.request, copy));
        }
        return response;
      });
    })
  );
});
