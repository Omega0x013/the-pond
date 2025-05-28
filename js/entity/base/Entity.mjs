const QUARTER_TURN = Math.PI / 2;

/**
 * An entity is a circle, and a set of pictures, with an orientation.
 */
export class Entity {
  x;
  y;
  facing; // Orient randomly.
  /**
   * A layer is a graphic. Layers are enabled or disabled.
   * @type {Array<{enabled: boolean, image: HTMLImageElement, cx: number, cy: number, scale: number}}
   */
  layers;
  r; // Collision radius.

  /**
   * 
   * @param {number} x 
   * @param {number} y 
   * @param {number} radius 
   * @param {Array<{enabled: boolean, image: HTMLImageElement, cx: number, cy: number, scale: number}} layers
   * @param {number} facing (rad)
   */
  constructor(x, y, radius = 0, layers = [], facing = Math.random() * Math.PI * 2) {
    // this.point = point;
    this.x = x;
    this.y = y;
    this.r = radius;
    this.facing = facing;
    this.layers = layers;
  }

  /**
   * Test whether or not two entities intersect
   * @param {Entity} entity other entity to test against
   * @returns boolean
   */
  collide(entity) {
    if (!entity) return false;
    return this.point.distance(entity?.point) <= (this.radius + entity.radius);
  }

  /**
   * Draw all the shown layers
   * @param {CanvasRenderingContext2D} context 
   * @param {Entity} camera 
   */
  draw(context, camera) {
    const position = this.translate(camera);

    for (const layer of this.layers) {
      if (!layer.enabled) {
        continue;
      }

      context.setTransform(layer.scale, 0, 0, layer.scale, position.x, position.y);
      context.rotate(this.facing + QUARTER_TURN);
      context.drawImage(layer.image, -layer.cx, -layer.cy);
    }
    // this.graphics[this.frame].draw(context, this.point, camera, this.orientation);
  }

  // Apply pythagoras to calculate the distance to another entity's center.
  distance(entity) {
    return Math.sqrt((entity.x - this.x) ** 2 + (entity.y - this.y) ** 2);
  }

  // The angle (rad) for this entity to face the target
  bearing(entity) {
    return Math.atan2(entity.y - this.y, entity.x - this.x);
  }

  translate(entity) {
    return new Entity(this.x - entity.x, this.y - entity.y);
  }
}