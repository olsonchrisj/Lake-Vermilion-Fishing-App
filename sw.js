const CACHE = 'lv-fishing-v2';
const ASSETS = ['./', 'index.html', 'style.css', 'app.js', 'data.js', 'bathymetry.js', 'manifest.json'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  // Always go to network for live data (weather, live map tiles); never cache these.
  if (url.includes('api.weather.gov') || url.includes('arcgisonline') || url.includes('tile.openstreetmap.org')) {
    return;
  }
  // Network-first for the app shell so updates (new spots, new report, fixes) show up
  // as soon as you're online, instead of getting stuck on whatever was cached first.
  // Falls back to the cached copy only when offline.
  event.respondWith(
    fetch(event.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
