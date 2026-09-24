import { CLICK_RADIUS, Display } from "./Display.mjs";
import { CreateFly, CreateFlyAction, FLY_ORBIT_SQ, RepositionFly } from "./fly.mjs";
import { Frog, FROG_JUMP_LIMIT, FROG_SIT_MASK } from "./frog.mjs";
import { LILY_LAYERS, LILY_RADIUS_MEAN, LILY_BASE_MASK, ChunkIndex, FindLocalChunks, LILY_STRIDE, LILY_OFFSET_FACING, LILY_OFFSET_X, LILY_OFFSET_ROTATION, LILY_OFFSET_SHOWN, LILY_OFFSET_Y, CreateRandomChunk } from "./map.mjs";

/**
 * @typedef {Object} Action
 * @property {number} rotation rad/ms rotation of the entity
 * @property {number} speed pt/ms speed of the entity
 * @property {number} duration ms duration of the action
 */

/**
 * @typedef {Object} Graphic An image, and the data needed to draw it correctly in-world
 * @property {HTMLImageElement} image
 * @property {number} cx
 * @property {number} cy
 * @property {number} scale
 */

/**
 * @typedef {Object} Entity
 * @property {number} x X
 * @property {number} y Y
 * @property {number} radius Radius
 * @property {number} facing Facing
 * @property {Action?} action 
 * @property {Graphic[]} graphics Array of graphics
 * @property {number} shown Which graphics are currently being shown
 */

// Start the service worker.
if (navigator.serviceWorker && !navigator.serviceWorker.controller) {
  await navigator.serviceWorker.register('worker.mjs', { 'scope': '/the-pond/' })
}

// Pre-run this calculation
const TWO_PI = Math.PI * 2;

// TODO: replace size mean with actual size of each lily?
const CLICK_SCAN_RANGE_SQ = CLICK_RADIUS * CLICK_RADIUS + LILY_RADIUS_MEAN * LILY_RADIUS_MEAN;
const KEYDOWN_SCAN_RANGE_SQ = FROG_JUMP_LIMIT * FROG_JUMP_LIMIT // I'm just guessing

const display = new Display(); // Start up the display

const frog = new Frog();

// const sample = RandomDisc([2000, 2000], 175, 5);
/** @type {Map<number, Float32Array>} */
const lilies = new Map();
const chunk = CreateRandomChunk(0, 0);
let targetDSq = Infinity, targetX, targetY;
for (let offset = 0; offset < chunk.length; offset += LILY_STRIDE) {
  const x = chunk[offset + LILY_OFFSET_X];
  const y = chunk[offset + LILY_OFFSET_Y];

  const dx = frog.x - x;
  const dy = frog.y - y;
  const dSq = dx * dx + dy * dy;

  if (dSq < targetDSq) {
    targetDSq = dSq;
    targetX = x, targetY = y;
  }
}
frog.x = targetX, frog.y = targetY;
lilies.set(ChunkIndex(0, 0), chunk);

/** @type {Entity[]} */
const flies = Array.from({ length: 5 }, () => CreateFly(frog));

/**
 * Moves an entity based on its current action.
 * 
 * @param {Entity} entity
 * @param {number} elapsed ms since last move
 */
export function Move(entity, elapsed) {
  const action = entity.action;

  // Make sure we only move as much as the remaining duration
  const delta = elapsed < action.duration ? elapsed : action.duration;

  // Short-circuit if the action is over
  if (delta > 0) {
    let facing = entity.facing + action.rotation * delta;

    // Clamp facing back into the normal range
    if (facing >= TWO_PI) facing %= TWO_PI;
    else if (facing < 0) facing = (facing % TWO_PI) + TWO_PI;

    entity.facing = facing;

    // Move to the new position
    const distance = action.speed * delta;
    entity.x += distance * Math.cos(facing);
    entity.y += distance * Math.sin(facing);
  }

  action.duration -= elapsed;
}

let previousTimestamp = performance.now();
const localChunks = [];
function update(timestamp) {
  const elapsed = timestamp - previousTimestamp;
  previousTimestamp = timestamp;

  // Unpackage the pending input
  let { type: pendingType, content: pendingAction } = display.pendingInput;
  display.pendingInput.type = null; // unset the pending action

  if (pendingType && !pendingAction) {
    console.warn('Pending input registered, but content was not present.', pendingType, pendingAction);
    pendingType = null;
  }

  // Select the best candidate lily to jump to.
  let targetLilyScore = -Infinity, targetLilyDx, targetLilyDy, targetLilyDSq;
  const frogX = frog.x, frogY = frog.y;

  const count = FindLocalChunks(lilies, frogX, frogY, localChunks);

  // Update lilypads
  for (let n = 0; n < count; n += 1) {
    const chunk = localChunks[n];
    for (let offset = 0; offset < chunk.length; offset += LILY_STRIDE) {
      let facing = chunk[offset + LILY_OFFSET_FACING];
      const rotation = chunk[offset + LILY_OFFSET_ROTATION];

      // Rotate lily
      facing += rotation * elapsed;
      chunk[offset + LILY_OFFSET_FACING] = facing;

      // We don't have to scan any lilies if the frog is jumping
      if (frog.jumping) {
        continue;
      }

      const x = chunk[offset + LILY_OFFSET_X];
      const y = chunk[offset + LILY_OFFSET_Y];
      const shown = chunk[offset + LILY_OFFSET_SHOWN];

      // Draw frog
      display.Draw(x, y, facing, shown, LILY_LAYERS);

      const frogDx = frogX - x;
      const frogDy = frogY - y;
      const frogDSq = frogDx * frogDx + frogDy * frogDy;

      if (pendingType === null) {
        if (frogDSq > 1_600) {
          continue;
        }

        // TODO: add item-specific behaviours
        if (shown > LILY_BASE_MASK) {
          chunk[offset + LILY_OFFSET_SHOWN] = LILY_BASE_MASK;
        }

        frog.action = {
          rotation,
          duration: Infinity,
          speed: 0,
        }

        continue;
      }

      if (pendingType === 'click') {
        const clickDx = pendingAction.x - x;
        const clickDy = pendingAction.y - y;
        const clickDSq = clickDx * clickDx + clickDy * clickDy;

        if (clickDSq >= CLICK_SCAN_RANGE_SQ || frogDSq < 1_600) {
          continue;
        }

        frog.JumpTo(frogDx, frogDy, frogDSq);

        continue;
      }

      if (pendingType === 'keydown') {
        if (frogDSq >= KEYDOWN_SCAN_RANGE_SQ || frogDSq < 250) {
          continue;
        }

        const distance = Math.sqrt(frogDSq);
        const nx = -frogDx / distance;
        const ny = -frogDy / distance;

        const alignment = pendingAction.x * nx + pendingAction.y * ny;

        // A negative alignment is too low to consider
        if (alignment <= 0) {
          continue;
        }

        const score = alignment / distance;
        if (score > targetLilyScore) {
          targetLilyDx = frogDx;
          targetLilyDy = frogDy;
          targetLilyDSq = frogDSq;
          targetLilyScore = score;
        }

        continue;
      }
    }
  }

  if (targetLilyScore > 0) {
    frog.JumpTo(targetLilyDx, targetLilyDy, targetLilyDSq);
  }

  if (frog.action) {
    Move(frog, elapsed);

    if (frog.action.duration <= 0) {
      frog.jumping = false;
      frog.shown = FROG_SIT_MASK;
    }
  }

  for (const fly of flies) {
    Move(fly, elapsed);

    if (fly.action.duration <= 0) {
      fly.action = CreateFlyAction();
    }

    const dx = frog.x - fly.x;
    const dy = frog.y - fly.y;
    const dSq = dx * dx + dy * dy;

    // Frog is jumping, so it eats the fly
    if (frog.jumping && dSq <= 2_500) {
      RepositionFly(fly, frog);
    }

    // The fly got too far away
    if (dSq > FLY_ORBIT_SQ) {
      RepositionFly(fly, frog);
    }
  }

  // Start drawing
  display.FocusOn(frog.x, frog.y);
  display.SetupContext();

  for (let n = 0; n < count; n += 1) {
    const chunk = localChunks[n];
    for (let offset = 0; offset < chunk.length; offset += LILY_STRIDE) {
      display.Draw(
        chunk[offset + LILY_OFFSET_X],
        chunk[offset + LILY_OFFSET_Y],
        chunk[offset + LILY_OFFSET_FACING],
        chunk[offset + LILY_OFFSET_SHOWN],
        LILY_LAYERS
      );
    }
  }

  display.DrawEntity(frog);

  for (const fly of flies) {
    display.DrawEntity(fly);
  }

  window.requestAnimationFrame(update);
}

window.requestAnimationFrame(update);
