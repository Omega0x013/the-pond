import { Lily, Bug, Frog, Point, addStat } from './entity/index.mjs';

const CLICK_RADIUS = 10;
const KEY_RANGE = 300;

const BUG_FOOD_VALUE = 4;
const DECAY_RATE = 0.05 / 1000;

const RENDER_LIMIT = 500;
const FULL_TURN = Math.PI * 2;
const QUARTER_TURN = FULL_TURN / 4;

function updateStat(key, elapsed) {
  console.warn("updateStat is temporarily disabled.");
  return;
  // const stat = addStat(key, -DECAY_RATE * elapsed);
  // document.querySelector(`#${key}`).value = stat;
  // return stat;
}

export class World {
  /**
   * @param {HTMLCanvasElement} canvas Canvas to bind the World to
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.context.fillStyle = 'skyblue';
    this.context.strokeStyle = 'white';

    this.frog = new Frog();
    // this.lilies = [new Lily(new Point(0, 0))];
    this.lilies = [];
    for (let y = -3000; y <= 3000; y += 150)
      for (let x = -3000; x <= 3000; x += 150)
        this.lilies.push(new Lily(new Point(x, y)));
    this.bugs = Array.from({ length: 3 }, () => new Bug());

    canvas.addEventListener('click', this.click.bind(this));
    document.addEventListener('keydown', this.keydown.bind(this));

    // Run the initial draw.
    this.update(0);
  }


  /**
   * Moves the game one step onward.
   * @param {number} elapsed ms elapsed since last call
   */
  update(elapsed) {
    // Decay stats
    // const food = updateStat('food', elapsed);
    // const clean = updateStat('clean', elapsed);
    // const sleep = updateStat('sleep', elapsed);

    // const happy = (food + (100 - sleep) + clean) / 3;
    // document.querySelector('#happy').value = happy;

    // if (food === 0 || clean === 0)
    //   document.querySelector('#dead-pet').dispatchEvent(new Event('open'));


    // Update game objects
    this.frog.move(elapsed);

    for (const bug of this.bugs) {
      bug.move(elapsed);

      switch (true) {
        case bug.collide(this.frog):
          addStat('food', BUG_FOOD_VALUE);
        case bug.point.distance(this.frog.point) > RENDER_LIMIT:
          bug.reposition(this.frog.point);
          break;
      }
    }

    this.center = new Point(this.canvas.width/2, this.canvas.height/2);

    // Draw - we only want to draw things that are visible onscreen, as the rest won't be visible.
    const camera = this.frog.point.translate(this.center);
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

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
    ).translate(this.center.translate(this.frog.point));

    // Work out if the click is onscreen
    if (location.distance(this.frog.point) > RENDER_LIMIT) {
      return;
    }

    // Find every lily it intersects with, then pick the closest
    const target = this.lilies.filter(
      lily => lily.point.distance(location) <= lily.radius + CLICK_RADIUS
    ).sort(
      (a, b) => a.point.distance(location) - b.point.distance(location)
    ).at(-1);

    // Assign the frog the new target
    this.frog.assign(target);
  }


  /**
   * When the player presses a directional key, scan in that direction
   * for a lily within range
   * @param {Event} event keydown event
   */
  keydown(event) {
    if (this.frog.action) return;
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
    const target = this.lilies.filter(
      lily => !this.frog.collide(lily) && this.frog.point.distance(lily.point) < KEY_RANGE
    ).sort(
      (a, b) =>
        Math.abs(scanAxis - this.frog.point.angle(a.point)) % FULL_TURN
        - Math.abs(scanAxis - this.frog.point.angle(b.point)) % FULL_TURN
    ).at(0);

    this.frog.assign(target);
  }
}