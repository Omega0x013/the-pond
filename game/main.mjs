import { CLICK_RADIUS, Display } from "./Display.mjs";
import { CreateFly, CreateFlyAction, FLY_ORBIT_SQ, RepositionFly } from "./fly.mjs";
import { Frog, FROG_JUMP_LIMIT, FROG_JUMP_MASK, FROG_SIT_MASK } from "./frog.mjs";
import { CreateLily, LILY_SIZE_MEAN, LILY_BASE_MASK } from "./map.mjs";
import { RandomDisc } from "./random.mjs";

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
const CLICK_SCAN_RANGE_SQ = CLICK_RADIUS * CLICK_RADIUS + LILY_SIZE_MEAN * LILY_SIZE_MEAN;
const KEYDOWN_SCAN_RANGE_SQ = FROG_JUMP_LIMIT * FROG_JUMP_LIMIT // I'm just guessing

const display = new Display(); // Start up the display

const frog = new Frog();

const sample = RandomDisc([2000, 2000], 175, 5);
/** @type {Entity[]} */
const lilies = [];
for (const [x, y] of sample) {
  lilies.push(CreateLily(x - 1000, y - 1000))
}

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

  // Target Lily, suitability score (for keydown)
  let targetLily, targetLilyScore = -Infinity;

  for (const lily of lilies) {
    // If the frog is jumping, short-circuit
    if (frog.jumping) {
      Move(lily, elapsed);
      continue;
    }

    const frog_dx = frog.x - lily.x;
    const frog_dy = frog.y - lily.y;
    const frog_dSq = frog_dx * frog_dx + frog_dy * frog_dy

    if (pendingType === null) {
      // If the frog is touching a lily, it rotates with it
      if (frog_dSq < 1_600) {
        frog.action = Object.assign({}, lily.action);

        // TODO: add item-specific behaviours
        if (lily.item) {
          lily.shown = LILY_BASE_MASK;
          lily.item = null;
        }
      }

      Move(lily, elapsed);
      continue;
    }

    if (pendingType === 'click') {
      const click_dx = pendingAction.x - lily.x;
      const click_dy = pendingAction.y - lily.y;
      const click_dSq = click_dx * click_dx + click_dy * click_dy;

      // If the click touches a lily, and the frog isn't touching it
      if (click_dSq < CLICK_SCAN_RANGE_SQ && !(frog_dSq < 1_600)) {
        frog.JumpTo(frog_dx, frog_dy, frog_dSq);
      }

      Move(lily, elapsed);
      continue;
    }

    if (pendingType === 'keydown') {
      if (frog_dSq > KEYDOWN_SCAN_RANGE_SQ || frog_dSq < 250) {
        Move(lily, elapsed);
        continue;
      }

      const distance = Math.sqrt(frog_dSq);
      const nx = -frog_dx / distance;
      const ny = -frog_dy / distance;

      const alignment = pendingAction.x * nx + pendingAction.y * ny;

      if (alignment <= 0) {
        Move(lily, elapsed);
        continue;
      }

      const score = alignment / distance;
      if (score > targetLilyScore) {
        targetLily = lily;
        targetLilyScore = score;
      }

      Move(lily, elapsed);
      continue;
    }
  }

  // If keyboard input was used, take a look
  if (targetLily) {
    frog.JumpToEntity(targetLily);
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

  for (const lily of lilies) {
    display.Draw(lily);
  }

  display.Draw(frog);

  for (const fly of flies) {
    display.Draw(fly);
  }

  window.requestAnimationFrame(update);
}

window.requestAnimationFrame(update);

