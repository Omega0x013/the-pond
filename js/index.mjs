import { FLY_LAYERS, FROG_LAYERS, LILY_LAYERS, Distance, Bearing, OrbitPosition, Draw, Move } from './entity.mjs';
import { Random, RandomBearing } from './random.mjs';

const RENDER_RANGE = 600;

const SEARCH_RANGE = 300;
const CLICK_RADIUS = 10;

const LILY_MIN_SIZE = 35;
const LILY_MAX_SIZE = 55;
const ITEM_SPAWN_CHANCE = 0.02;
const LILY_ROTATION_CHANCE = 0.1;
const LILY_ROTATION_MEAN = 0;
const LILY_ROTATION_STDEV = Math.PI * 0.00005;

const FROG_SPEED = 0.75;

const FLY_ORBIT = 400;
const FLY_DURATION_MEAN = 2000;
const FLY_DURATION_STDEV = 200;
const FLY_ROTATION_MEAN = 0;
const FLY_ROTATION_STDEV = Math.PI / 2048;
const FLY_SPEED_MEAN = 0.1; // uses Math.abs
const FLY_SPEED_STDEV = 0.1;

const FULL_TURN = Math.PI * 2;
const OVERLAY_DURATION = 1500;

// Start the service worker.
if (navigator.serviceWorker && !navigator.serviceWorker.controller) {
  await navigator.serviceWorker.register('worker.mjs', { 'scope': '/the-pond/' })
}

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

// Create the frog.
const frog = {
  x: 0,
  y: 0,
  radius: 30,
  facing: RandomBearing(),
  action: null,
  layers: [true, false]
};

/**
 * Create a new lilypad at the desired coordinates.
 * Each lily has a chance of having an item or rotating
 * @param {number} x 
 * @param {number} y 
 * @returns {Entity}
 */
function newLily(x, y) {
  const lily = {
    x: x,
    y: y,
    radius: 40,
    facing: RandomBearing(),
    layers: [true, false, false, false]
  };

  // If a lilypad rotates, it can't have an item on it, since the item graphics have a fixed orientation.
  if (Math.random() < LILY_ROTATION_CHANCE) {
  // Add rotation
    lily.action = {
      duration: Infinity,
      rotation: Random(LILY_ROTATION_MEAN, LILY_ROTATION_STDEV),
      speed: 0
    };
  } else {
    lily.action = null;
    // Add item
    lily.item = Math.random() < ITEM_SPAWN_CHANCE && Math.floor(Math.random() * 3) + 1;
    if (lily.item > 0) {
      lily.layers[lily.item] = true;
    }
  }

  return lily;
}

// Create initial lily pads.
const lilies = [];
for (let y = -2000; y <= 2000; y += 200)
  for (let x = -2000; x <= 2000; x += 200) {
    lilies.push(newLily(x, y));
  }

// Create flies.
const flies = [];
for (let i = 0; i < 3; i++) {
  const fly = {
    radius: 20,
    action: null,
    layers: [true]
  };
  // Position the fly around the frog.
  repositionFly(fly, frog);
  flies.push(fly);
}

// Add event listeners
resize();
window.addEventListener('resize', resize);

// TODO: click
window.addEventListener('click', click);
// TODO: keydown
document.addEventListener('keydown', keydown);

// Start main loop

/**
 * @type {number}
 */
let previousTimestamp = performance.now();

/**
 * @type {{x: number, y: number}}
 */
let camera;

/**
 * The duration for which the overlay will continue to be shown onscreen.
 * @type {number}
 */
let overlayCircle;

/**
 * Main loop.
 * @param {DOMHighResTimeStamp} timestamp 
 */
function update(timestamp) {
  // Calculate elapsed milliseconds.
  const elapsed = timestamp - previousTimestamp;
  previousTimestamp = timestamp;

  // Clear previous scene.
  context.clearRect(0, 0, canvas.width, canvas.height);

  // TODO: Calculate camera position.
  camera = { x: frog.x - canvas.width / 2, y: frog.y - canvas.height / 2 }

  // If the frog is sitting on a lily, save that lily.
  let satOnLily;

  // Move and draw lilypads.
  for (const lily of lilies) {
    Move(lily, elapsed);

    const distance = Distance(frog, lily);

    if (distance > RENDER_RANGE) {
      continue;
    }

    // If the frog is touching the lilypad
    if (distance < frog.radius + lily.radius) {
      if (lily.item > 0) {
        lily.item = 0;
        lily.layers = [true, false, false, false];
      }
      satOnLily = lily;
    }

    Draw(context, camera, lily, LILY_LAYERS);
  }

  // Move and draw frog.
  Move(frog, elapsed);

  if (frog.action === null) {
    frog.layers = [true, false];

    frog.facing += (satOnLily?.action?.rotation ?? 0) * elapsed;
  }

  Draw(context, camera, frog, FROG_LAYERS);

  // Move and draw flies.
  for (const fly of flies) {
    Move(fly, elapsed);

    if (fly.action === null) {
      fly.action = {
        duration: Math.abs(Random(FLY_DURATION_MEAN, FLY_DURATION_STDEV)),
        rotation: Random(FLY_ROTATION_MEAN, FLY_ROTATION_STDEV),
        speed: Math.abs(Random(FLY_SPEED_MEAN, FLY_SPEED_STDEV))
      };
    }

    if (frog.action !== null && Distance(frog, fly) < frog.radius + fly.radius) {
      repositionFly(fly, frog);
    }

    if (Distance(frog, fly) > RENDER_RANGE) {
      repositionFly(fly, frog);
    }

    Draw(context, camera, fly, FLY_LAYERS);
  }

  // Draw overlay circle.
  if (overlayCircle > 0) {
    overlayCircle -= elapsed;
    drawDashedCircle(context, canvas.width / 2, canvas.height / 2, SEARCH_RANGE);
  }

  // Loop.
  requestAnimationFrame(update);
}

requestAnimationFrame(update);

/**
 * Place the fly on the edge of the frog's orbit, facing inward.
 * @param {Object} fly 
 * @param {Object} frog 
 */
function repositionFly(fly, frog) {
  const { x, y } = OrbitPosition(frog, FLY_ORBIT, RandomBearing());
  fly.x = x;
  fly.y = y;
  fly.facing = Bearing(fly, frog);
}

/**
 * Set `a`'s action to move toward `b` at the given speed.
 * @param {Entity} a 
 * @param {Entity} b 
 * @param {number} speed
 */
function moveToward(a, b, speed) {
  const distance = Distance(a, b);
  if (distance < b.radius) {
    return;
  }

  if (distance > SEARCH_RANGE) {
    overlayCircle = OVERLAY_DURATION;
    return;
  }

  a.facing = Bearing(a, b);
  a.action = {
    duration: distance / speed,
    rotation: 0,
    speed: speed
  }
  a.layers = [false, true];
}

/**
 * Draw a dashed circle centered on (x,y) with a given radius onto the provided context.
 * @param {CanvasRenderingContext2D} context 
 * @param {number} x 
 * @param {number} y 
 * @param {number} radius 
 */
function drawDashedCircle(context, x, y, radius) {
  context.save();
  context.globalAlpha = 0.5;
  context.strokeStyle = "grey";
  context.lineWidth = 2;
  context.setLineDash([5, 5]);
  context.beginPath();
  context.arc(x, y, radius, 0, FULL_TURN);
  context.stroke();
  context.restore();
}

// Event listener functions.

/**
 * Respond to resize events
 * @param {Event} _event 
 */
function resize(_event) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

/**
 * Respond to clicks
 * @param {MouseEvent} event 
 */
function click(event) {
  if (frog.action !== null) {
    return;
  }

  const clickEntity = {
    x: event.clientX + camera.x,
    y: event.clientY + camera.y,
  };

  let target;
  for (const lily of lilies) {
    if (Distance(clickEntity, lily) < CLICK_RADIUS + lily.radius) {
      target = lily;
      break;
    }
  }

  if (!target) {
    if (Distance(frog, clickEntity) > SEARCH_RANGE) {
      overlayCircle = 1500;
    }
    return;
  }

  moveToward(frog, target, FROG_SPEED);
}

/**
 * Respond to keyboard input
 * @param {KeyboardEvent} event 
 */
function keydown(event) {
  if (frog.action || event.isComposing) {
    return
  };

  let scanAxis;

  switch (event.code) {
    case "KeyD":
    case "ArrowRight":
      scanAxis = 0 * Math.PI; // Right
      break;
    case "KeyS":
    case "ArrowDown":
      scanAxis = 0.5 * Math.PI; // Down
      break;
    case "KeyA":
    case "ArrowLeft":
      scanAxis = Math.PI; // Left (equivalent to -1 * Math.PI)
      break;
    case "KeyW":
    case "ArrowUp":
      scanAxis = -0.5 * Math.PI; // Up
      break;

    // Diagonal Movement
    case "KeyW" && "KeyD": // Up-Right
      scanAxis = -0.25 * Math.PI;
      break;
    case "KeyW" && "KeyA": // Up-Left
      scanAxis = -0.75 * Math.PI;
      break;
    case "KeyS" && "KeyD": // Down-Right
      scanAxis = 0.25 * Math.PI;
      break;
    case "KeyS" && "KeyA": // Down-Left
      scanAxis = 0.75 * Math.PI;
      break;

    default:
      return;
  }


  let target;

  let min = Infinity
  for (const lily of lilies) {
    // Filter out lilies that are too distant or in collision.
    const distance = Distance(frog, lily)
    if (distance > SEARCH_RANGE || distance < frog.radius + lily.radius) {
      continue;
    }

    // Find the absolute angle
    const difference = scanAxis - Bearing(frog, lily);
    const angle = Math.abs(Math.atan2(Math.sin(difference), Math.cos(difference)));

    // 
    if (angle > .125) {
      continue;
    }

    if (angle < min) {
      target = lily;
      min = angle;
    }
  }

  if (!target) {
    overlayCircle = OVERLAY_DURATION;
    return;
  }

  moveToward(frog, target, FROG_SPEED);
}
