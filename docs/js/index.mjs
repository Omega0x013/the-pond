import { World } from "./World.mjs";

// Add caching service worker
if (!navigator.serviceWorker?.controller)
  await navigator.serviceWorker?.register('worker.mjs', { 'scope': '/the-pond/' });

const canvas = document.querySelector('canvas');
const world = new World(canvas);

// Avoid extra allocations
let now, elapsed;

function update(_time) {
  now = Date.now();
  elapsed = now - +localStorage.getItem('last');
  localStorage.setItem('last', now);

  world.update(elapsed);

  requestAnimationFrame(update);
}

requestAnimationFrame(update);