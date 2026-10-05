/* Service worker: menyimpan file aplikasi di HP supaya bisa dibuka tanpa internet.
   Kalau kamu mengubah index.html, ganti angka versi di bawah (v1 jadi v2) agar HP mengambil file baru. */
const CACHE = 'kasir-konter-v2';
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Ambil dari penyimpanan dulu (cepat dan offline), sambil memperbarui di belakang layar.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((hit) => {
      const net = fetch(e.request).then((res) => {
        if (res && (res.ok || res.type === 'opaque')) {
          const salinan = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, salinan));
        }
        return res;
      }).catch(() => hit || caches.match('./index.html'));
      return hit || net;
    })
  );
});
