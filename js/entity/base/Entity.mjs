import { Graphic } from './Graphic.mjs';
import { Point } from './Point.mjs';

/**
 * An entity is a circle, and a set of pictures, with an orientation.
 */
export class Entity {
  /**
   * @param {Point} point starting co-ordinates of the entity
   * @param {number} radius radius in pixels
   * @param {Graphic[]} graphics set of pictures
   */
  constructor(point, radius = 0, graphics = []) {
    this.point = point;
    this.radius = radius;
    this.orientation = Math.random() * Math.PI * 2; // orient the new entity randomly
    this.graphics = graphics;
    this.frame = 0;
  }

  /**
   * Test whether or not two entities intersect
   * @param {Entity} entity other entity to test against
   * @returns boolean
   */
  collide(entity) {
    if (!entity) return false;
    return this.point.distance(entity?.point) <= this.radius + entity.radius;
  }

  draw(context, camera) {
    this.graphics[this.frame].draw(context, this.point, camera, this.orientation);
  }
}