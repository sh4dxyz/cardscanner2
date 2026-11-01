// CartoScan : la coquille de l'appli reste utilisable hors ligne.
// Réseau d'abord (les mises à jour arrivent tout de suite), cache en secours.
const CACHE='cartoscan-shell-v2';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','manifest.webmanifest','icon-192.png'])).catch(()=>{}))});
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  // l'index de reconnaissance est déjà mis en cache par l'appli elle-même
  if(e.request.method!=='GET'||u.origin!==location.origin||u.pathname.includes('cartes-pokemon-index'))return;
  e.respondWith(fetch(e.request).then(r=>{if(r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c))}return r})
    .catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match('./'))));
});
