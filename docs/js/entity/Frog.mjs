import { Entity } from "./base/Entity.mjs";
import { Graphic } from "./base/Graphic.mjs";
import { Point, addStat } from "./index.mjs";

const FROG_SPEED = 0.75;
const JUMP_COST = 1;
const ITEM_VALUE = 30;

export class Frog extends Entity {
  constructor() {
    super(new Point(0, 0), 30, [
      new Graphic('/img/frog-sit.svg', 0.25, 135, 120),
      new Graphic('/img/frog-jump.svg', 0.25, 93, 150)
    ]);
  }

  /**
   * The frog moves directly toward a targeted entity, in this case a lily pad.
   * Once within reach it will snap directly to its destination, to make sure it always shows up at
   * the centre of the lily pad.
   */
  move(elapsed) {
    if (!this.action) return;

    if (this.collide(this.action)) {
      if (this.action.item) {
        switch (this.action.item) {
          case 1:
            addStat('sleep', -ITEM_VALUE);
            break;
          case 2:
            addStat('food', ITEM_VALUE);
            break;
          case 3:
            addStat('clean', ITEM_VALUE);
            break;
        }
        this.action.item = null;
      }
      this.point = this.action.point.clone();
      this.action = null;
      this.frame = 0;
    } else {
      this.orientation = this.point.angle(this.action.point);
      this.point.x += Math.cos(this.orientation) * elapsed * FROG_SPEED;
      this.point.y += Math.sin(this.orientation) * elapsed * FROG_SPEED;
    }
  }

  /**
   * The frog maintains a reference to its current target
   * @param {Entity} entity targeted entity
   */
  assign(entity) {
    // We're already there
    if (!entity || this.collide(entity)) return;
    const sleep = addStat('sleep', JUMP_COST);
    if (sleep === 100) {
      document.querySelector('#exhausted').dispatchEvent(new Event('open'));
      return;
    };

    this.action = entity;
    this.frame = 1;
  }
}