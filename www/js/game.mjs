import {Entity, Frame, translate} from './entity.mjs';

// Add caching service worker
if (!navigator.serviceWorker?.controller)
  await navigator.serviceWorker?.register('/worker.mjs', { 'scope': '/' });

function newFrog(x, y) {
  return new Entity([
    new Frame('/img/frog-sit.svg', 0.25, 135, 120),
    new Frame('/img/frog-jump.svg', 0.25, 93, 150)
  ],
  {x, y},
  50, 0,
  false);
}

function newLily(x, y) {
  return new Entity([
    new Frame('/img/lily.svg', 0.25, 170, 170)
  ],
  {x, y},
  40, 0,
  true);
}

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

ctx.fillStyle = 'skyblue';

const frog = newFrog(200, 250);
const lilies = [newLily(30, 30), newLily(250, 250)];
const bugs = [];

function update(elasped) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillRect(0, 0, 500, 500);

  // Draw Lilies and Items
  for (const lily of lilies)
    lily.draw(ctx, translate(frog.point, {x: -250, y: -250}));

  // Draw Frog
  frog.draw(ctx);

  // // Draw Bugs
  // for (const bug of bugs)
  //   bug.draw(ctx, frog.point);
  requestAnimationFrame(update);
}

function click(event) {
  const c = new Entity([], translate({x: event.clientX - canvas.offsetLeft, y: event.clientY - canvas.offsetTop}, translate(frog.point, {x: -250, y: -250})), 10);
  const targets = lilies.filter(entity => entity.clickable && entity.collide(c));
  console.log(targets);
}

canvas.addEventListener('click', click);
requestAnimationFrame(update);