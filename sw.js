const VERSION = 'tamapoke-family-v07-world-engine-20260804';
const WORLD_FOLDERS = ["normal", "grass", "fire", "water", "electric", "ice", "bug", "poison", "ground", "rock", "flying", "psychic", "ghost", "dark", "dragon", "fairy", "fighting", "steel"];
const CORE = [
  './', './index.html', './styles.css', './manifest.webmanifest',
  './js/app.js', './js/storage.js', './js/sprite-engine.js', './js/game-engine.js', './js/worlds.js',
  './data/species.json', './assets/icons/icon-192.png', './assets/icons/icon-512.png',
  './assets/ui/apple.png', './assets/ui/arrow.png', './assets/ui/ball.png', './assets/ui/book.png',
  './assets/ui/brush.png', './assets/ui/bubbles.png', './assets/ui/camera.png', './assets/ui/coin.png',
  './assets/ui/dumbbell.png', './assets/ui/egg.png', './assets/ui/friends.png', './assets/ui/gear.png',
  './assets/ui/gem.png', './assets/ui/heart.png', './assets/ui/home.png', './assets/ui/leaf.png',
  './assets/ui/moon.png', './assets/ui/shop.png', './assets/ui/star.png', './assets/ui/trophy.png', './assets/ui/world.png',
  ...WORLD_FOLDERS.map((folder) => `./assets/worlds/${folder}/world.json`),
  './assets/worlds/normal/day/background.png',
  './assets/worlds/normal/day/midground.png',
  './assets/worlds/normal/day/foreground.png',
  './assets/worlds/normal/day/overlay.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key)))));
  self.clients.claim();
});

async function networkFirst(request) {
  const cache = await caches.open(VERSION);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw error;
  }
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(event.request).catch(() => caches.match('./index.html')));
    return;
  }

  if (url.pathname.includes('/assets/worlds/')) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok) caches.open(VERSION).then((cache) => cache.put(event.request, response.clone()));
    return response;
  })));
});
