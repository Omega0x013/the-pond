import World from './world.mjs';

/**
 * TODO:
 * - Actions
 * - Items
 * - World Expansion
 * - Saves
 */

// Add caching service worker
if (!navigator.serviceWorker?.controller)
  await navigator.serviceWorker?.register('/worker.mjs', { 'scope': '/' });

const canvas = document.querySelector('canvas');
const world = new World(canvas);

let previous = 0;

/**
 * @param {number} time Time elapsed since animation started
 */
function update(time) {
  const elapsed = time - previous;
  previous = time;

  world.update(elapsed);
  world.expand();
  world.draw();

  requestAnimationFrame(update);
}

requestAnimationFrame(update);