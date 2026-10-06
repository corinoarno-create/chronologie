'use strict';
const VERSION = "2026-10-06.2";
(function travailleurHorsLigne(){
  const CACHE = 'chronologie-' + VERSION;
  self.addEventListener('install', e => {
    self.skipWaiting();
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', 'manifest.webmanifest', 'icon-192.png'])).catch(() => {}));
  });
  self.addEventListener('activate', e => {
    e.waitUntil(caches.keys()
      .then(cles => Promise.all(cles.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim()));
  });
  self.addEventListener('fetch', e => {
    const req = e.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);
    const local = url.origin === location.origin;
    if (local && url.pathname.endsWith('/donnees.json')) return;
    if (!local && !/^fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) return;
    const cle = local ? url.origin + url.pathname : req.url;
    const garder = rep => {
      if (rep.ok || rep.type === 'opaque'){ const copie = rep.clone(); caches.open(CACHE).then(c => c.put(cle, copie)); }
      return rep;
    };
    if (!local){ e.respondWith(caches.match(cle).then(r => r || fetch(req).then(garder))); return; }   // polices : cache d'abord
    e.respondWith(fetch(req).then(garder).catch(() =>                                                // page : réseau d'abord
      caches.match(cle).then(r => r || caches.match(new URL('./', location.href).href))));
  });
})();
