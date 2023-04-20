/**
 * Translate a co-ordinate according to a visual root.
 * @param {{x, y}} point Internal co-ordinates
 * @param {{x, y}} camera Camera co-ordinates
 * @returns {{x, y}}
 */
export function translate(point, camera = { x: 0, y: 0 }) {
  return { x: point.x - camera.x, y: point.y - camera.y };
}


export class Graphic {
  /**
   * @param {string} path File path to load
   * @param {number} scale Scale multiplier
   * @param {number} cx Center X
   * @param {number} cy Center Y
   */
  constructor(path, scale, cx, cy) {
    this.image = new Image();
    this.image.src = path;
    this.scale = scale;
    this.cx = cx, this.cy = cy;
  }

  /**
   * @param {CanvasRenderingContext2D} ctx 
   * @param {{x, y}} point Center
   * @param {number} rotation Rotation in degrees
   */
  draw(ctx, point, rotation) {
    ctx.setTransform(this.scale, 0, 0, this.scale, point.x, point.y);
    ctx.rotate(rotation);
    ctx.drawImage(this.image, -this.cx, -this.cy);
  }
}


/**
 * An entity is composed of a circle, a facing direction, and a set of graphics.
 */
export class Entity {
  /**
   * @param {Array<Graphic>} frames Array of drawable graphics
   * @param {{x, y}} point 
   * @param {number} radius 
   * @param {number} rotation 
   */
  constructor(graphics = [], point = { x: 0, y: 0 }, radius = 0, rotation = Math.random()*Math.PI*2) {
    this.graphics= graphics;
    this.frame = 0;
    this.point = point;
    this.radius = radius;
    this.rotation = rotation; // in radians
    this.action = null;
  }

  /**
   * Draws the entity on the specified context
   * @param {CanvasRenderingContext2D} ctx Context to draw on
   * @param {{x, y}} camera New root to draw from
   */
  draw(ctx, camera = { x: 0, y: 0 }) {
    this.graphics[this.frame]?.draw(ctx, translate(this.point, camera), this.rotation + (Math.PI / 2));
  }

  /**
   * Calculates the centre-centre distance between this and another entity
   * @param {Entity} entity 
   * @returns {number}
   */
  distance(entity) {
    return Math.sqrt((this.point.x - entity.point.x) ** 2 + (this.point.y - entity.point.y) ** 2);
  }

  /**
   * Calculates the rotation figure needed to point this entity at the target entity.
   * @param {Entity} entity 
   */
  angle(entity) {
    // Borrowed: https://gist.github.com/conorbuck/2606166?permalink_comment_id=2344498#gistcomment-2344498
    return Math.atan2(entity.point.y - this.point.y, entity.point.x - this.point.x);
  }

  /**
   * Determines whether or not two entities are touching.
   * @param {Entity} entity 
   * @returns {boolean}
   */
  collide(entity) {
    return this.distance(entity) < (this.radius + entity.radius);
  }

  /**
   * Make a working clone of this object
   * @returns Entity
   */
  clone() {
    return Object.assign(Object.create(this), this);
  }

  moveTo(elapsed, actionEntity) {
    
  }

  moveSmooth(elapsed) {

  }
}


/**
 * These functions construct entities with the appropriate graphics and
 * and values.
 */

/**
 * @param {number} x 
 * @param {number} y 
 * @returns {Entity}
 */
export function newFrog(x, y) {
  return new Entity([
    new Graphic('/img/frog-sit.svg', 0.25, 135, 120),
    new Graphic('/img/frog-jump.svg', 0.25, 93, 150)
  ],
  {x, y},
  30);
}

/**
 * @param {number} x 
 * @param {number} y 
 * @returns {Entity}
 */
export function newLily(x, y) {
  return new Entity([
    new Graphic('/img/lily.svg', 0.25, 170, 170)
  ],
  {x, y},
  40);
}

/**
 * @param {number} x 
 * @param {number} y 
 * @returns {Entity}
 */
export function newBug(x, y) {
  return new Entity([
    new Graphic('/img/bug.svg', 0.1, 189, 70)
  ],
  {x, y},
  20)
}

export function newActionEntity(entity) {
  return new Entity([], entity.action.point, 0);
}