import { World } from "./World.mjs";

// Add caching service worker
if (!navigator.serviceWorker?.controller)
  await navigator.serviceWorker?.register('worker.mjs', { 'scope': '/the-pond/' });

const canvas = document.querySelector('canvas');

resize();
window.addEventListener('resize', resize);

const world = new World(canvas);
requestAnimationFrame(update);

function update(_time) {
  const now = performance.now();
  const elapsed = now - +localStorage.getItem('last');
  localStorage.setItem('last', now);

  world.update(elapsed);

  requestAnimationFrame(update);
}


function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}