async function cacheIt(req) {
    if (!navigator.onLine) {
      return caches.match(req);
    }
    
    try {
        const res = await fetch(req);
        const cache = await caches.open('cache');
        cache.put(req.url, res.clone());
        return res;
    } catch (error) {
        return caches.match(req);
    }
}
  
self.addEventListener('fetch', e => e.respondWith(cacheIt(e.request)));