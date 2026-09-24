/** @type {Map<string, object>} */
const DIR_VECTORS = new Map([
  ["KeyD", { x: 1, y: 0 }], ["ArrowRight", { x: 1, y: 0 }],
  ["KeyS", { x: 0, y: 1 }], ["ArrowDown", { x: 0, y: 1 }],
  ["KeyA", { x: -1, y: 0 }], ["ArrowLeft", { x: -1, y: 0 }],
  ["KeyW", { x: 0, y: -1 }], ["ArrowUp", { x: 0, y: -1 }],
])

export const CLICK_RADIUS = 20;
const SAFE_SIZE = 800; // px
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
    dpr: 1,
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

  DrawEntity(entity) {
    this.Draw(entity.x, entity.y, entity.facing, entity.shown, entity.graphics);
  }

  /**
   * 
   * @param {number} x 
   * @param {number} y 
   * @param {number} facing 
   * @param {number} shown 
   * @param {import("./main.mjs").Graphic[]} layers 
   */
  Draw(x, y, facing, shown, layers) {
    this.#context.save();
    this.#context.translate(x, y);
    this.#context.rotate(facing + HALF_PI);

    for (let layer = 0; layer < layers.length; layer += 1) {
      if ((shown & (1 << layer)) === 0) {
        continue;
      }

      const graphic = layers[layer];

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
    const dpr = Math.max(1, window.devicePixelRatio || 1);

    // Cache the screen dimensions for speed
    const cssWidth = window.innerWidth;
    const cssHeight = window.innerHeight;

    // Make the canvas the same virtual pixels as physical
    this.#canvas.width = Math.floor(cssWidth * dpr);
    this.#canvas.height = Math.floor(cssHeight * dpr);

    // Make sure the canvas is the same size onscreen
    this.#canvas.style.width = `${cssWidth}px`;
    this.#canvas.style.height = `${cssHeight}px`;

    this.#viewport.width = cssWidth;
    this.#viewport.height = cssHeight;
    this.#viewport.scale = (Math.min(this.#canvas.width, this.#canvas.height) / SAFE_SIZE);
    this.#viewport.offsetX = (this.#canvas.width - SAFE_SIZE * this.#viewport.scale) / 2;
    this.#viewport.offsetY = (this.#canvas.height - SAFE_SIZE * this.#viewport.scale) / 2;
    this.#viewport.dpr = dpr; // Store for input coordinate mapping
  }

  #click(event) {
    this.pendingInput.type = 'click';

    const rect = this.#canvas.getBoundingClientRect();
    const dpr = this.#viewport.dpr || 1;

    const rawX = (event.clientX - rect.left) * dpr;
    const rawY = (event.clientY - rect.top) * dpr;

    const safeX = (rawX - this.#viewport.offsetX) / this.#viewport.scale;
    const safeY = (rawY - this.#viewport.offsetY) / this.#viewport.scale;

    const centeredX = safeX - (SAFE_SIZE / 2);
    const centeredY = safeY - (SAFE_SIZE / 2);

    const zoom = this.#camera.zoom || 1;

    this.pendingInput.content = {
      x: (centeredX / zoom) + this.#camera.x,
      y: (centeredY / zoom) + this.#camera.y,
      radius: CLICK_RADIUS / (this.#viewport.scale * zoom),
    };
  }

  #keydown(event) {
    const vector = DIR_VECTORS.get(event.code);
    // If they didn't press a registered key, don't do anything
    if (!vector) {
      return;
    }

    this.pendingInput.type = 'keydown';
    this.pendingInput.content = vector;
  }
}
