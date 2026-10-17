/**
 * sw.js - Service Worker for CofFood Progressive Web App (PWA)
 * Cung cấp khả năng chạy offline, nạp nhanh tài nguyên (App Shell) và lưu bộ nhớ đệm thông minh.
 */

const CACHE_NAME = 'coffood-pwa-v2.2';

// Các tài nguyên cốt lõi (App Shell) được lưu đệm ngay khi cài đặt
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/css/style.css',
  '/assets/css/style.css?v=4.5',
  '/js/models/state.js',
  '/js/models/state.js?v=4.5',
  '/js/services/apiService.js',
  '/js/services/apiService.js?v=4.5',
  '/js/views/view.js',
  '/js/views/view.js?v=4.5',
  '/js/controllers/appController.js',
  '/js/controllers/appController.js?v=4.5',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
  '/assets/icons/icon-maskable-192x192.png',
  '/assets/icons/icon-maskable-512x512.png',
  '/assets/icons/apple-touch-icon.png',
  '/assets/icons/favicon-32x32.png',
  'https://unpkg.com/lucide@latest',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap'
];

// 1. Cài đặt Service Worker (Pre-cache App Shell)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return Promise.allSettled(
          PRECACHE_ASSETS.map((url) =>
            cache.add(url).catch((err) => {
              console.warn('[PWA] Bỏ qua nạp đệm url:', url, err);
            })
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// 2. Kích hoạt & dọn dẹp các phiên bản cache cũ
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[PWA] Dọn dẹp cache cũ:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Chiến lược nạp dữ liệu (Fetch Strategy)
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Chỉ xử lý các yêu cầu GET
  if (req.method !== 'GET') return;

  // Bỏ qua các giao thức không phải http/https (như chrome-extension://)
  if (!url.protocol.startsWith('http')) return;

  // Chiến lược A: Dành cho API dữ liệu (/api/places) -> Network-First (Ưu tiên mạng, lỗi mạng thì dùng Cache)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return networkRes;
        })
        .catch(() => {
          return caches.match(req).then((cachedRes) => {
            if (cachedRes) return cachedRes;
            // Trả về JSON rỗng fallback nếu hoàn toàn mất mạng và chưa có cache
            return new Response(JSON.stringify([]), {
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }

  // Chiến lược B: Dành cho trang HTML điều hướng -> Network-First (fallback về cache index.html khi offline)
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          const resClone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          return networkRes;
        })
        .catch(() => {
          return caches.match('/index.html') || caches.match('/');
        })
    );
    return;
  }

  // Chiến lược C: Dành cho Static Assets (CSS, JS, Fonts, Icons, Images) -> Stale-While-Revalidate
  event.respondWith(
    caches.match(req).then((cachedRes) => {
      const fetchPromise = fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return networkRes;
        })
        .catch(() => cachedRes);

      return cachedRes || fetchPromise;
    })
  );
});
