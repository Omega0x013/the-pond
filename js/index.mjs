import { Lily, Fly, Frog, Point, addStat } from './entity/index.mjs';

const CLICK_RADIUS = 10;
const KEY_RANGE = 300;

const FLY_FOOD_VALUE = 4;
const DECAY_RATE = 0.05 / 1000;

const RENDER_LIMIT = 500;
const FULL_TURN = Math.PI * 2;
const QUARTER_TURN = FULL_TURN / 4;

// Add caching service worker
if (navigator.serviceWorker && navigator.serviceWorker?.controller)
  await navigator.serviceWorker?.register('worker.mjs', { 'scope': '/the-pond/' });

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

const frog = new Frog();
const lilies = [];

for (let y = -3000; y <= 3000; y += 150)
  for (let x = -3000; x <= 3000; x += 150)
    lilies.push(new Lily(new Point(x, y)));

const flies = Array.from({ length: 3 }, () => new Fly());

// Listen for screen size changes
resize();
window.addEventListener('resize', resize);

// Listen for mouse clicks and touchscreen taps
window.addEventListener('click', click)

// Listen for keyboard input
document.addEventListener('keydown', keydown);

// Start animation loop
let previousTimestamp = performance.now();
requestAnimationFrame(update);

let center, camera;
function update(timestamp) {
  // Calculate elapsed ms.
  const elapsed = timestamp - previousTimestamp;
  previousTimestamp = timestamp;

  // Wipe screen.
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Gen in-world camera position.
  center = new Point(canvas.width / 2, canvas.height / 2);
  camera = frog.point.translate(center);

  // Draw lilypads.
  for (const lily of lilies) {
    if (frog.point.distance(lily.point) > RENDER_LIMIT) {
      continue;
    }

    lily.draw(context, camera);
  }

  // Move and draw frog;
  frog.move(elapsed);
  frog.draw(context, camera);

  // Move and draw flies;
  for (const fly of flies) {
    fly.move(elapsed);

    if (frog.action && frog.collide(fly)) {
      fly.reposition(frog.point);
    }

    if (frog.point.distance(fly.point) > RENDER_LIMIT) {
      fly.reposition(frog.point);
    }

    fly.draw(context, camera)
  }

  requestAnimationFrame(update);
}

function resize(_event) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function click(event) {
  // If the frog is already jumping, ignore.
  if (frog.action) { return; }

  let location = new Point(event.clientX, event.clientY).translate(center.translate(frog.point));

  if (location.distance(frog.point) > RENDER_LIMIT) { return; }

  const target = lilies.filter(
    lily => lily.point.distance(location) <= lily.radius + CLICK_RADIUS
  ).sort(
    (a, b) => a.point.distance(location) - b.point.distance(location)
  ).at(-1);

  frog.assign(target);
}

function keydown(event) {
  if (frog.action) return;
    if (event.isComposing || event.keyCode === 229) return;

    let scanAxis;

    switch (event.code) {
      case "KeyD":
      case "ArrowRight":
        scanAxis = 0;
        break;
      case "KeyS":
      case "ArrowDown":
        scanAxis = 1;
        break;
      case "KeyA":
      case "ArrowLeft":
        scanAxis = 2;
        break;
      case "KeyW":
      case "ArrowUp":
        scanAxis = 3;
        break;
      default:
        return;
    }

    scanAxis *= QUARTER_TURN;
    scanAxis %= FULL_TURN;

    /**
     * Find all targets within range, then pick the one closest to the desired axis.
     */
    const target = lilies.filter(
      lily => !frog.collide(lily) && frog.point.distance(lily.point) < KEY_RANGE
    ).sort(
      (a, b) =>
        Math.abs(scanAxis - frog.point.angle(a.point)) % FULL_TURN
        - Math.abs(scanAxis - frog.point.angle(b.point)) % FULL_TURN
    ).at(0);

    frog.assign(target);
}