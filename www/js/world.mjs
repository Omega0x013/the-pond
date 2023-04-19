import { translate, Entity, newFrog, newLily, newBug, newActionEntity } from './entity.mjs';

const FROG_SPEED = .75;
const BUG_MEAN = 0;
const BUG_STDEV = 50;

// *** https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
// Standard Normal variate using Box-Muller transform.
function gaussianRandom(mean=BUG_MEAN, stdev=BUG_STDEV) {
  let u = 1 - Math.random(); // Converting [0,1) to (0,1]
  let v = Math.random();
  let z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
  // Transform to the desired mean and standard deviation:
  return z * stdev + mean;
}
// ***


export default class World {
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
    this.lilies = [newLily(0, 0), newLily(-250, 0), newLily(-200, -100), newLily(0, -150), newLily(-100, -150), newLily(-100, 100), newLily(-300, -100)];
    this.bugs = [newBug(-50, -50), newBug(-50, -50), newBug(80, -50)];
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
      this.frog.move(elapsed, actionEntity);
    }

    // update all the bugs
    for (const bug of this.bugs) {
      if (bug.action) {
        // make an entity using the bug.action property to use the distance and collide functions on
        const actionEntity = newActionEntity(bug);

        // snap the bug to its final position
        if (bug.collide(actionEntity)) {
          bug.point = bug.action.point;
          bug.action = null;
          return;
        }

        // it got eaten
        if (bug.collide(this.frog)) console.log('nom');

        // move the bug
        bug.move(elapsed, actionEntity);
      } else {
        bug.action = {
          point: translate(bug.point, {x: gaussianRandom(), y: gaussianRandom()}),
          velocity: null
        }
        // To calculate the velocity of the new action, we choose how long it will take and use v = d/t
        const actionEntity = newActionEntity(bug);
        bug.action.velocity = bug.distance(actionEntity) / Math.abs(gaussianRandom(2000, 200));
        // the gaussian random has a chance of making a -ve number, and we don't want to go backwards
      }
    }
  }

  draw() {
    // Shallow-copy the entity to use the existing collide function to detect if something is onscreen.
    const cameraEntity = this.frog.clone();
    cameraEntity.radius = 354;

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

    // Draw UI
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
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

      this.frog.action = {point: {...target.point}, velocity: FROG_SPEED};
      console.log(this.frog.action.point);
      this.frog.frame = 1;
    }
  }
}