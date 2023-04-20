import { Lily, Bug, Frog, Point, addStat } from './entity/index.mjs';

const CAMERA_OFF = new Point(250, 250);
const CLICK_RADIUS = 10;
const BUG_FOOD_VALUE = 5;
const JUMP_COST = 5;
const DECAY_RATE = 0.05 / 1000;
const RENDER_LIMIT = 500;

function updateStat(key, elapsed) {
  const stat = addStat(key, -DECAY_RATE * elapsed);
  document.querySelector(`#${key}`).value = stat;
  return stat;
}

export class World {
  /**
   * @param {HTMLCanvasElement} canvas Canvas to bind the World to
   */
  constructor(canvas) {
    // this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.context.fillStyle = 'skyblue';

    this.frog = new Frog();
    this.lilies = [new Lily(new Point(0, 0)), new Lily(new Point(0, 100))];
    this.bugs = Array.from({ length: 7 }, () => new Bug());

    canvas.addEventListener('click', this.click.bind(this));
  }


  /**
   * Moves the game one step onward.
   * @param {number} elapsed ms elapsed since last call
   */
  update(elapsed) {
    // Decay stats
    const food = updateStat('food', elapsed);
    const clean = updateStat('clean', elapsed);
    const sleep = updateStat('sleep', elapsed);
    
    const happy = (food + (100 - sleep) + clean) / 3;
    document.querySelector('#happy').value = happy;

    // Update game objects
    this.frog.move(elapsed);

    for (const bug of this.bugs) {
      bug.move(elapsed);

      switch(true) {
        case bug.collide(this.frog):
          addStat('food', BUG_FOOD_VALUE);
        case bug.point.distance(this.frog.point) > RENDER_LIMIT:
          bug.reposition(this.frog.point);
          break;
      }
    }

    // Draw - we only want to draw things that are visible onscreen, as the rest won't be visible.
    const camera = this.frog.point.translate(CAMERA_OFF);
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.fillRect(0, 0, 500, 500);

    /** @type {Entity[]} */
    let drawables = [].concat(this.lilies, [this.frog], this.bugs);
    drawables = drawables.filter(entity => entity.point.distance(this.frog.point) < RENDER_LIMIT);

    for (const drawable of drawables)
      drawable.draw(this.context, camera);
  }


  /**
   * Responds to the player clicking within the canvas
   * @param {Event} event onclick event
   */
  click(event) {
    if (this.frog.action) return;

    // Work out where the click is in the game world
    const location = new Point(
      event.clientX - event.target.offsetLeft,
      event.clientY - event.target.offsetTop
    ).translate(CAMERA_OFF.translate(this.frog.point));

    // Find every lily it intersects with, then pick the closest
    const target = this.lilies.filter(
      lily => lily.point.distance(location) <= lily.radius + CLICK_RADIUS
    ).sort(
      (a, b) => a.point.distance(location) - b.point.distance(location)
    ).at(-1);

    // Assign the frog the new target
    this.frog.assign(target);
  }
}