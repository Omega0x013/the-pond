import { translate, Entity, newFrog, newLily, newBug, newActionEntity } from './entity.mjs';

const FROG_SPEED = .75;
const BUG_MEAN = 0;
const BUG_STDEV = Math.PI / 128;
const BUG_VALUE = 5;
const SCREEN_RADIUS = 354;

// *** https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
// Standard Normal variate using Box-Muller transform.
function gaussianRandom(mean = BUG_MEAN, stdev = BUG_STDEV) {
  let u = 1 - Math.random(); // Converting [0,1) to (0,1]
  let v = Math.random();
  let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  // Transform to the desired mean and standard deviation:
  return z * stdev + mean;
}
// ***

/**
 * gets and parses a float point value from a localstorage index
 * @param {string} key localStorage key to retrieve from
 * @returns {number}
 */
export function getFloat(key) {
  const n = Number.parseFloat(localStorage.getItem(key));
  if (Number.isNaN(n))
    return 0;
  return n;
}

/**
 * Updates the meter element to match the value, then passes the value through
 * @param {string} stat 
 * @param {number} value 
 * @returns {number}
 */
function showStat(stat, value = 0) {
  document.querySelector(`#${stat}`).value = value;
  return value;
}


export class World {
  /**
   * @param {HTMLCanvasElement} canvas 
   * @param {Entity} frog 
   */
  constructor(canvas, frog = new newFrog(0, 0)) {
    this.canvas = canvas;

    // Get rendering context
    this.ctx = canvas.getContext('2d');
    this.ctx.fillStyle = 'skyblue';

    // Bind click event
    this.canvas.addEventListener('click', this.click.bind(this));

    // Build entity arrays
    this.frog = frog;
    // this.lilies = [newLily(0, 0)]; // the root lily makes sure there's always one near the player
    this.lilies = [];
    for (let i = -5000; i <= 5000; i+=100)
      this.lilies.push(newLily(i, 0));
    this.bugs = Array.from({length: 7}, () => newBug(500, 500)); // there will always be 7 bugs on or near the screen
  }

  /**
   * Updates all world objects.
   * @param {number} elapsed ms elapsed since last update
   */
  update(elapsed) {
    // update the frog
    if (this.frog.action) {
      const actionEntity = newActionEntity(this.frog);

      // snap the frog to its final position
      if (this.frog.collide(actionEntity)) {
        this.frog.point = this.frog.action.point;
        this.frog.action = null;
        this.frog.frame = 0;
        return;
      }

      // move the frog
      this.frog.rotation = this.frog.angle(actionEntity);
      this.frog.point.x += Math.cos(this.frog.rotation) * this.frog.action.velocity * elapsed;
      this.frog.point.y += Math.sin(this.frog.rotation) * this.frog.action.velocity * elapsed;
    }

    // update all the bugs
    for (const bug of this.bugs) {
      if (bug.action) {
        switch (true) {
          // Move the bug back toward the player; if it got eaten, also add food.
          case bug.collide(this.frog):
            localStorage.setItem('food', getFloat('food') + BUG_VALUE);
          case bug.distance(this.frog) > 500:
            // choose an angle from the player, place the bug at that point 300 pixels away
            // and face it at the player, then let it choose its curve on its own.
            const angle = Math.random() * Math.PI * 2;
            const x = this.frog.point.x + Math.cos(angle) * SCREEN_RADIUS;
            const y = this.frog.point.y + Math.sin(angle) * SCREEN_RADIUS;
            bug.point = {x: x, y: y};
            bug.rotation = bug.angle(this.frog);
            break;
        }

        // move the bug
        bug.action.time -= elapsed;
        if (bug.action.time <= 0) {
          bug.action = null;
          return;
        }

        bug.rotation += bug.action.curve;
        bug.point.x += Math.cos(bug.rotation) * bug.action.velocity * elapsed;
        bug.point.y += Math.sin(bug.rotation) * bug.action.velocity * elapsed;

      } else {
        // the bug moves along curving paths, in rad/ms at px/ms for X ms amount of time.
        bug.action = {
          curve: gaussianRandom(BUG_MEAN, BUG_STDEV),
          velocity: Math.abs(gaussianRandom(0, 0.1)),
          time: Math.abs(gaussianRandom(2000, 200))
        }
      }
    }
  }

  draw() {
    // Shallow-copy the entity to use the existing collide function to detect if something is onscreen.
    const cameraEntity = this.frog.clone();
    cameraEntity.radius = SCREEN_RADIUS;

    // Draw backdrop
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.fillRect(0, 0, 500, 500);

    // Select only entities that would appear on screen
    const drawables = [].concat(this.lilies, [this.frog], this.bugs).filter(entity => entity.collide(cameraEntity));

    // Get camera root
    const camera = translate(cameraEntity.point, { x: 250, y: 250 });

    // Draw entities
    for (const drawable of drawables)
      drawable.draw(this.ctx, camera);

    // Update meters
    let sum = 0;
    sum += showStat('food', getFloat('food'));
    sum += 100 - showStat('sleep', getFloat('sleep')); // the pet gets less happy as it gets more tired
    sum += showStat('clean', getFloat('clean'));
    showStat('happy', sum / 3);
  }

  /**
   * Grow the world around the player, if necessary.
   */
  expand() {

  }

  /**
   * Responds to clicks on the canvas, tests buttons first, then lily pads.
   * @param {Event} event
   */
  click(event) {
    // Take advantage of the existing collide function by creating an entity to
    // test which lilies the user has clicked on.
    const c = new Entity([], translate({ x: event.clientX - this.canvas.offsetLeft, y: event.clientY - this.canvas.offsetTop }, translate({ x: 250, y: 250 }, this.frog.point)), 10);
    const targets = this.lilies; // TODO: add buttons to this.
    const target = targets.filter(entity => entity.collide(c))?.sort((a, b) => a.distance(c) - b.distance(c))?.at(-1);

    if (!this.frog.action && target) {
      if (this.frog.collide(target)) return;

      let tiredness = getFloat('sleep');
      tiredness += 5;

      // If tiredness is max, we can't jump anymore
      if (tiredness >= 100) {
        tiredness = 100;
      } else {
        this.frog.action = { point: { ...target.point }, velocity: FROG_SPEED };
        this.frog.frame = 1;
      }

      localStorage.setItem('sleep', tiredness);
    }
  }
}