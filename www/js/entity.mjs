/**
 * Translate a co-ordinate according to a visual root.
 * @param {{x, y}} point Absolute co-ordinates
 * @param {{x, y}} root Relative co-ordinates
 * @returns {{x, y}}
 */
export function translate(point, root = { x: 0, y: 0 }) {
  return { x: point.x + (root.x ?? 0), y: point.y + (root.y ?? 0) };
}


export class Frame {
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
    ctx.rotate((rotation / 180) * Math.PI);
    ctx.drawImage(this.image, -this.cx, -this.cy);
  }
}


export class Entity {
  /**
   * @param {Array<Frame>} frames Array of drawable
   * @param {{x, y}} point 
   * @param {number} radius 
   * @param {number} rotation 
   */
  constructor(frames, point = { x: 0, y: 0 }, radius = 0, rotation = 0, clickable = false) {
    this.frames = frames;
    this.frame = 0;
    this.point = point;
    this.radius = radius;
    this.rotation = rotation;
    this.clickable = clickable;
  }

  /**
   * @param {CanvasRenderingContext2D} ctx Context to draw on
   * @param {{x, y}} root New root to draw from
   */
  draw(ctx, root = { x: 0, y: 0 }) {
    this.frames[this.frame]?.draw(ctx, translate(this.point, root), this.rotation);
  }

  /**
   * Checks whether or not two entities overlap.
   * @param {Entity} entity 
   */
  collide(entity) {
    return (((this.point.x - entity.point.x) ** 2 + (this.point.y - entity.point.y) ** 2) ** 0.5) < (this.radius + entity.radius);
  }
}