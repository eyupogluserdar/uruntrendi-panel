const CACHE_NAME = 'ut-pos-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/vite.svg',
    '/manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', (event) => {
    // HTML veya JS dosyaları için her zaman ağa git, önbelleği kullanma (Deployment çakışmasını önler)
    if (event.request.mode === 'navigate' || event.request.url.includes('.js')) {
        event.respondWith(fetch(event.request));
        return;
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
