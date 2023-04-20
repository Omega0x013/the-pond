import { Entity } from "./base/Entity.mjs";
import { Graphic } from "./base/Graphic.mjs";

export class Lily extends Entity {
  constructor(point) {
    super(point, 40, [
      new Graphic('/img/lily.svg', 0.25, 170, 170)
    ]);
  }
}