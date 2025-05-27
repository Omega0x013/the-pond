import { Entity } from "./base/Entity.mjs";
import { Graphic } from "./base/Graphic.mjs";
import { Point } from "./index.mjs";

const FLY_CURVE_MEAN = 0; // rad/ms
const FLY_CURVE_STDEV = Math.PI / 128;
const FLY_SPEED_MEAN = 0; // pix/ms
const FLY_SPEED_STDEV = 0.1;
const FLY_TIME_MEAN = 2000; // ms
const FLY_TIME_STDEV = 200;

// *** https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
// Standard Normal variate using Box-Muller transform.
function gaussianRandom(mean, stdev) {
  let u = 1 - Math.random(); // Converting [0,1) to (0,1]
  let v = Math.random();
  let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  // Transform to the desired mean and standard deviation:
  return z * stdev + mean;
}
// ***

export class Fly extends Entity {
  constructor() {
    super(new Point(1000, 1000), 20, [
      new Graphic('img/fly.svg', 0.1, 189, 70)
    ]);

    this.action = null;
  }

  /**
   * Flies move in arcs, turning at rad/ms, moving at pix/ms, for ms amount of time
   * @param {number} elapsed ms since last update
   */
  move(elapsed) {
    if (this.action) {
      this.action.time -= elapsed;
      if (this.action.time <= 0) {
        this.action = null;
      } else {
        this.orientation += this.action.curve;
        this.point.x += Math.cos(this.orientation) * elapsed * this.action.speed;
        this.point.y += Math.sin(this.orientation) * elapsed * this.action.speed;
      }
    } else {
      this.action = {
        curve: gaussianRandom(FLY_CURVE_MEAN, FLY_CURVE_STDEV),
        speed: Math.abs(gaussianRandom(FLY_SPEED_MEAN, FLY_SPEED_STDEV)),
        time: gaussianRandom(FLY_TIME_MEAN, FLY_TIME_STDEV)
      }
    }
  }

  /**
   * Move to a point on a circle just offscreen from the point, face toward
   * the point, then let the fly decide for itself its next action.
   * @param {Point} point point from which to reposition
   */
  reposition(point) {
    const angle = Math.random() * Math.PI * 2;
    this.point.x = point.x + Math.cos(angle) * 354;
    this.point.y = point.y + Math.sin(angle) * 354;
    this.orientation = this.point.angle(point);
    this.action = null;
  }
}