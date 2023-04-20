/**
 * A point is a pair of game co-ordinates
 */
export class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * Uses pythagoras to calculate the distance between this and another point
   * @param {Point} point 
   * @returns number
   */
  distance(point) {
    return Math.sqrt((point.x - this.x) ** 2 + (point.y - this.y) ** 2);
  }

  /**
   * Calculates the radians angle needed to face an entity at this point toward the target point
   * @param {Point} point 
   * @returns {number}
   */
  angle(point) {
    return Math.atan2(point.y - this.y, point.x - this.x);
  }

  /**
   * Used to translate between screen and world co-ordinates
   * @param {Point} point point to translate toward
   * @returns Point
   */
  translate(point) {
    return new Point(this.x - point.x, this.y - point.y);
  }

  /**
   * Makes a copy of this point, so that no references are created.
   * @returns Point
   */
  clone() {
    return new Point(this.x, this.y);
  }
}