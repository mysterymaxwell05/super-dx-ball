// Offline support for the installed app (same approach as the Retro Racing phone version).
// The game page is fetched fresh first so updates show up straight away; songs/icons are cached once.
const CORE = 'super-dx-ball-v1';
const MEDIA = 'super-dx-ball-media';
const CORE_FILES = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(CORE).then(c => c.addAll(CORE_FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CORE && k !== MEDIA).map(k => caches.delete(k)))).then(() => self.clients.claim())));
const isPage = req => req.mode === 'navigate' || /\/(index\.html)?$/.test(new URL(req.url).pathname);
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (isPage(req)) {
    e.respondWith(fetch(req, { cache: 'no-store' }).then(res => {
      if (res && res.ok) { const copy = res.clone(); caches.open(CORE).then(c => c.put('./index.html', copy)); }
      return res;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(r => r || fetch(req).then(res => {
    if (res && res.ok && /\/(music|icons)\//.test(new URL(req.url).pathname)) { const copy = res.clone(); caches.open(MEDIA).then(c => c.put(req, copy)); }
    return res;
  })));
});
