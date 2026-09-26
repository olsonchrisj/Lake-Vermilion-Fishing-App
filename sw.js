const CACHE = 'lv-fishing-v3';
const TILE_CACHE = 'lv-fishing-tiles-v1';
const MAX_TILES = 500;
const LEAFLET = [
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];
const ASSETS = [
  './', 'index.html', 'style.css', 'app.js', 'data.js', 'analysis.js', 'bathymetry.js',
  'reports.auto.js', 'reports.checked.js', 'manifest.json', 'icons/icon.svg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(async (cache) => {
    await cache.addAll(ASSETS);
    // Leaflet comes from a CDN (cross-origin); cache it too so the map still loads
    // offline. Failure here shouldn't block install.
    await Promise.all(LEAFLET.map(u =>
      fetch(u, { mode: 'no-cors' }).then(r => cache.put(u, r)).catch(() => {})
    ));
  }));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== TILE_CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function trimTiles() {
  const cache = await caches.open(TILE_CACHE);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - MAX_TILES; i++) await cache.delete(keys[i]);
}

function isTile(url) {
  return url.includes('arcgisonline') || url.includes('tile.openstreetmap.org');
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = req.url;
  // Live weather is never cached — stale conditions are worse than none.
  if (url.includes('api.weather.gov')) return;

  // Map tiles: network first, remember the ones you've seen so the areas you've
  // browsed still draw when you lose cell signal at the lake.
  if (isTile(url)) {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(TILE_CACHE).then(c => c.put(req, copy)).then(trimTiles);
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // App shell: network first so updates show up as soon as you're online, falling
  // back to the cached copy when offline. Only successful responses get cached.
  event.respondWith(
    fetch(req)
      .then(res => {
        if (res && (res.ok || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(CACHE).then(cache => cache.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }))
  );
});
