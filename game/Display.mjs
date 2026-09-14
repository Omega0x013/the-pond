/** @type {Map<string, object>} */
const DIR_VECTORS = new Map([
  ["KeyD", { x: 1, y: 0 }], ["ArrowRight", { x: 1, y: 0 }],
  ["KeyS", { x: 0, y: 1 }], ["ArrowDown", { x: 0, y: 1 }],
  ["KeyA", { x: -1, y: 0 }], ["ArrowLeft", { x: -1, y: 0 }],
  ["KeyW", { x: 0, y: -1 }], ["ArrowUp", { x: 0, y: -1 }],
])

const CLICK_RADIUS = 10;
const SAFE_SIZE = 1000; // px
const HARD_CIRCLE = 80; // u
const HARD_CIRCLE_SQ = HARD_CIRCLE * HARD_CIRCLE;
const HALF_PI = Math.PI / 2;

/**
 * The `Display` manages the canvas and allows clicks to be translated to world coordinates.
 */
export class Display {
  #canvas;
  #context;

  #viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  };

  #camera = {
    x: 0,
    y: 0,
    zoom: 2.0,
  };

  pendingInput = {
    /** @type {string?} */
    type: null,
    /** @type {object | import("./main.mjs").Entity | null} */
    content: null,
  };

  constructor() {
    this.#canvas = document.querySelector('canvas');
    this.#context = this.#canvas.getContext('2d');

    // Scale the game for the screen size
    this.#resize();
    window.addEventListener('resize', () => {
      window.requestAnimationFrame(this.#resize.bind(this));
    });

    window.addEventListener('click', this.#click.bind(this));
    window.addEventListener('keydown', this.#keydown.bind(this));
  }

  SetupContext() {
    this.#context.reset();

    this.#context.translate(this.#viewport.offsetX, this.#viewport.offsetY);
    this.#context.scale(this.#viewport.scale, this.#viewport.scale);
    this.#context.translate(SAFE_SIZE / 2, SAFE_SIZE / 2);

    this.#context.scale(this.#camera.zoom, this.#camera.zoom);
    this.#context.translate(-this.#camera.x, -this.#camera.y);
  }

  Draw(entity) {
    this.#context.save();
    this.#context.translate(entity.x, entity.y);
    this.#context.rotate(entity.facing + HALF_PI);

    for (let layer = 0; layer < entity.graphics.length; layer += 1) {
      if (entity.shown.at(layer) === false) {
        continue;
      }

      const graphic = entity.graphics.at(layer);

      this.#context.drawImage(
        graphic.image,
        -graphic.cx * graphic.scale,
        -graphic.cy * graphic.scale,
        graphic.image.width * graphic.scale,
        graphic.image.height * graphic.scale
      );
    }

    this.#context.restore();
  }

  /**
   * Brings target entity into view
   * @param {import("./entity.mjs").Entity} target 
   */
  FocusOn(x, y) {
    const dx = this.#camera.x - x;
    const dy = this.#camera.y - y;
    const distSq = dx * dx + dy * dy;

    // Target is inside the deadzone
    if (distSq <= HARD_CIRCLE_SQ) {
      return;
    }

    const d = Math.sqrt(distSq);

    this.#camera.x = x + (dx / d) * HARD_CIRCLE;
    this.#camera.y = y + (dy / d) * HARD_CIRCLE;
  }

  #resize() {
    this.#viewport.width = window.innerWidth;
    this.#viewport.height = window.innerHeight;
    this.#viewport.scale = Math.min(this.#viewport.width / SAFE_SIZE, this.#viewport.height / SAFE_SIZE);
    this.#viewport.offsetX = (this.#viewport.width - SAFE_SIZE * this.#viewport.scale) / 2;
    this.#viewport.offsetY = (this.#viewport.height - SAFE_SIZE * this.#viewport.scale) / 2;

    // Cause canvas to reflect the stored viewport
    this.#canvas.width = this.#viewport.width;
    this.#canvas.height = this.#viewport.height;
  }

  #click(event) {
    this.pendingInput.type = 'click';

    const rect = this.#canvas.getBoundingClientRect();

    const rawX = event.clientX - rect.left;
    const rawY = event.clientY - rect.top;

    const safeX = (rawX - this.#viewport.offsetX) / this.#viewport.scale;
    const safeY = (rawY - this.#viewport.offsetY) / this.#viewport.scale;

    const centeredX = safeX - (SAFE_SIZE / 2);
    const centeredY = safeY - (SAFE_SIZE / 2);

    const zoom = this.#camera.zoom || 1;

    this.pendingInput.content = {
      x: (centeredX / zoom) + this.#camera.x,
      y: (centeredY / zoom) + this.#camera.y, // Matches the rendering -camera.y
      radius: CLICK_RADIUS / (this.#viewport.scale * zoom),
    };
  }

  #keydown(event) {
    this.pendingInput.type = 'keydown';
    this.pendingInput.content = DIR_VECTORS.get(event.code);
  }
}
