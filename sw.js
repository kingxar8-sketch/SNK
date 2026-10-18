/* Offline cache: pages open instantly and still work without internet (showing the last saved data).
   Live scores always come from the network (Google Apps Script is never cached here). */
const CACHE = 'tournament-v1';
const CORE = ['./', 'index.html', 'admin.html', 'manifest.webmanifest', 'admin.webmanifest', 'icons/icon-192.png', 'icons/admin-icon-192.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if(r.method !== 'GET' || u.origin !== location.origin) return;          /* only this site's own files */
  e.respondWith(fetch(r).then(res => { if(res.ok){ const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); } return res; })
    .catch(() => caches.match(r).then(m => m || (r.mode === 'navigate' ? caches.match(u.pathname.endsWith('admin.html') ? 'admin.html' : 'index.html') : Response.error()))));
});
