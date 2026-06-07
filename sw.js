const CACHE = 'chat-wingman-v1';
const ASSETS = ['./','./index.html','./manifest.json'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS).catch(()=>{})));
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>{
    return Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
  }));
  self.clients.claim();
});

self.addEventListener('fetch',e=>{
  // Only cache same-origin, skip API calls
  if(e.request.method!=='GET' || e.request.url.includes('api.deepseek.com')) return;
  e.respondWith(
    caches.match(e.request).then(cached=>{
      const fetched = fetch(e.request).then(resp=>{
        if(resp && resp.status===200){
          const clone = resp.clone();
          caches.open(CACHE).then(c=>c.put(e.request,clone));
        }
        return resp;
      }).catch(()=>cached);
      return cached || fetched;
    })
  );
});
