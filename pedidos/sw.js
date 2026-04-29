const CACHE = 'bananisimo-pedidos-v1';
const BASE  = '/bananisimo/pedidos';
self.addEventListener('install',  e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll([BASE+'/',BASE+'/index.html',BASE+'/manifest.json']).catch(()=>{}))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if(e.request.method!=='GET'||url.hostname.includes('supabase')||url.hostname.includes('googleapis')||url.hostname.includes('jsdelivr'))return;
  e.respondWith(fetch(e.request).then(r=>{if(r.ok){const c=r.clone();caches.open(CACHE).then(cache=>cache.put(e.request,c));}return r;}).catch(()=>caches.match(e.request)));
});
