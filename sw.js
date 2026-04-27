// ── BANANÍSIMO · Service Worker ──────────────────────────────
// Estrategia: Network First → si hay red, siempre descarga lo nuevo.
// Si no hay red, sirve desde caché. Las actualizaciones se aplican
// automáticamente la próxima vez que se abre la app.

const CACHE_NAME = 'bananisimo-v4';

const PRECACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// ── INSTALL: precachear recursos estáticos ────────────────────
self.addEventListener('install', event => {
  self.skipWaiting(); // activar inmediatamente sin esperar
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
  );
});

// ── ACTIVATE: limpiar cachés viejos ──────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim()) // tomar control inmediato de todos los tabs
  );
});

// ── FETCH: Network First ──────────────────────────────────────
self.addEventListener('fetch', event => {
  // Solo interceptar GETs del mismo origen (no Supabase, no fonts)
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET') return;
  if (!url.origin.includes('github.io') && !url.pathname.startsWith('/')) return;
  if (url.hostname.includes('supabase') || url.hostname.includes('googleapis')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Guardar copia fresca en caché
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request)) // fallback a caché si no hay red
  );
});
