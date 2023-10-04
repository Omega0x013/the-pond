import { Point } from "./Point.mjs";

const QUARTER_TURN = Math.PI / 2;

export class Graphic {
  constructor(path, scale, cx, cy) {
    this.image = new Image();
    this.image.src = path;
    this.scale = scale;
    this.cx = cx;
    this.cy = cy;
  }

  /**
   * Draws the graphic into the world
   * @param {CanvasRenderingContext2D} context Context to draw on
   * @param {Point} location Game co-ordinates of the center of the graphic
   * @param {Point} camera Game co-ordinates of the camera
   * @param {number} orientation Orientation in radians from the +x axis
   */
  draw(context, location, camera = new Point(0, 0), orientation = 0) {
    const position = location.translate(camera);
    context.setTransform(this.scale, 0, 0, this.scale, position.x, position.y);
    context.rotate(orientation + QUARTER_TURN);
    context.drawImage(this.image, -this.cx, -this.cy);
  }
}