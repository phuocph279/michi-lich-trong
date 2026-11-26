// Lưu sẵn khung app để mở nhanh, kể cả khi mạng yếu.
// Dữ liệu lịch KHÔNG lưu ở đây (app tự lưu bản gần nhất), nên lịch luôn lấy mới khi có mạng.
var BAN = 'michi-app-v2';
var KHUNG = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(BAN).then(function (c) { return c.addAll(KHUNG); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== BAN; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // dữ liệu Google: để app tự xử lý
  // Mạng trước (để luôn có bản app mới nhất), mất mạng thì dùng bản đã lưu
  e.respondWith(fetch(e.request).then(function (res) {
    var copy = res.clone();
    caches.open(BAN).then(function (c) { c.put(e.request, copy); });
    return res;
  }).catch(function () {
    return caches.match(e.request).then(function (r) { return r || caches.match('./index.html'); });
  }));
});
