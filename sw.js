// Service Worker: macht Burg Funkelstein offline nutzbar (aus der Schatzinsel übernommen).
// Beim Hinzufügen von Dateien: CORE ergänzen und CACHE hochzählen (tools/check.mjs prüft das).
// Strategie: alles aus dem Cache beantworten und im Hintergrund auffrischen –
// so startet die App sofort und holt sich Updates beim nächsten Öffnen mit Netz.
const CACHE = 'funkelstein-v4';

const CORE = [
  './', 'index.html', 'manifest.webmanifest', 'css/app.css', 'js/app.js', 'js/engine/audio.js', 'js/engine/level.js',
  'js/engine/playtime.js', 'js/engine/router.js', 'js/engine/storage.js', 'js/engine/util.js', 'js/content/castle.js',
  'js/content/paths.js', 'js/content/places.js', 'js/content/texts.js', 'js/art/castle.js', 'js/art/figure.js', 'js/art/fips.js',
  'js/art/icons.js', 'js/art/rooms.js', 'js/art/shade.js', 'js/art/things.js', 'js/art/wald.js', 'js/art/world.js', 'js/games/drag.js', 'js/games/spuren.js', 'js/games/wald.js', 'js/games/zaehlen.js', 'js/screens/castle.js',
  'js/screens/eltern.js', 'js/screens/figur.js', 'js/screens/gate.js', 'js/screens/map.js', 'js/screens/pause.js',
  'js/screens/place.js', 'js/screens/round.js', 'js/screens/title.js', 'assets/audio/index.json', 'assets/icons/icon-180.png',
  'assets/icons/icon-192.png', 'assets/icons/icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(CORE);
    // Alle Sprach-Clips mitnehmen, damit Fips auch ohne Netz spricht.
    try {
      const index = await (await fetch('assets/audio/index.json')).json();
      const files = [...new Set(Object.values(index))].map(f => 'assets/audio/' + f);
      await cache.addAll(files);
    } catch { /* Clips werden sonst beim ersten Abspielen nachgeladen */ }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(n => n !== CACHE).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req, { ignoreSearch: true });
    const refresh = fetch(req).then(res => {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    }).catch(() => null);
    if (cached) {
      event.waitUntil(refresh);
      return cached;
    }
    const fresh = await refresh;
    if (fresh) return fresh;
    if (req.mode === 'navigate') return cache.match('index.html');
    return new Response('', { status: 504 });
  })());
});
