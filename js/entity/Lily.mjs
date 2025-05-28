import { Entity } from "./base/Entity.mjs";

/**
 * A lily is a target for the frog to jump on, and may contain an item.
 * When landed on, the item is consumed and the pet's stats increased.
 */
export class Lily extends Entity {
  item = (Math.random() < 0.02) && Math.floor(Math.random()*3)+1;
  constructor(x, y) {
    super(x, y, 40, [
      {
        enabled: true,
        image: document.querySelector('#lily'),
        scale: .25,
        cx: 170,
        cy: 170
      },
      {
        enabled: false,
        image: document.querySelector('#pill'),
        scale: .1,
        cx: 200,
        cy: 275
      },
      {
        enabled: false,
        image: document.querySelector('#cookie'),
        scale: .1, 
        cx: 250,
        cy: 250
      },
      {
        enabled: false,
        image: document.querySelector('#brush'),
        scale: .1, 
        cx: 50,
        cy: 275
      }
    ])

    if (item) {
      this.layers[item].enabled = true;
    }
  }
}