import { Entity } from "./base/Entity.mjs";
import { Graphic } from "./base/Graphic.mjs";

/**
 * A lily is a target for the frog to jump on, and may contain an item.
 * When landed on, the item is consumed and the pet's stats increased.
 */
export class Lily extends Entity {
  constructor(point) {
    super(point, 40, [
      new Graphic('img/lily.svg', 0.25, 170, 170),
      new Graphic('img/pill.svg', .1, 200, 275),
      new Graphic('img/cookie.svg', .1, 250, 250),
      new Graphic('img/brush.svg', .1, 50, 275)
    ]);
    this.item = Math.floor(Math.random()*50) ? null : Math.floor(Math.random()*3)+1;
  }

  /**
   * 
   * @param {CanvasRenderingContext2D} context Context to draw on
   * @param {Point} camera Point about which to orient the drawing
   */
  draw(context, camera) {
    this.graphics[this.frame].draw(context, this.point, camera, this.orientation);
    this.graphics[this.item]?.draw(context, this.point, camera, Math.PI * 3.5);
  }
}