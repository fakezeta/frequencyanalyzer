const CACHE_NAME = 'audio-freq-pwa-v1';
const FILES_TO_CACHE = [
  '/index.html', // Assicurati del path corretto
  '/app.js',
  '/styles.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Installazione
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

// Rimozione cache obsoleta
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name.startsWith('audio-freq-pwa') && name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
});

// Gestisce le richieste Fetch
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(() => caches.match('/index.html')) // Pagina di fallback se offline
  );
});