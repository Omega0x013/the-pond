async function cacheFetch(req) {
  // If we're offline, just send the cached version
  if (!navigator.onLine) {
    return caches.match(req);
  }

  // If we're online, try to get a fresh resource
  try {
    const res = await fetch(req);
    const cache = await caches.open('cache');
    // and cache it for later.
    cache.put(req.url, res.clone());
    return res;
  } catch (err) {
    // Else return the cached version
    return caches.match(req);
  }
}

self.addEventListener('fetch', e => e.respondWith(cacheFetch(e.request)));