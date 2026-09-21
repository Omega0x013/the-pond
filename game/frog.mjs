import { FROG_LAYERS } from '../sprite/frog/frog.mjs';

const FROG_SPEED = 0.75; // u/ms
const TWO_PI = Math.PI * 2;
export const FROG_JUMP_LIMIT = 400;

export const FROG_SIT_MASK = 0b01;
export const FROG_JUMP_MASK = 0b10;

/** @extends import("./main.mjs").Entity */
export class Frog {
  x = 0;
  y = 0;
  radius = 30;
  facing = Math.PI * 1.5;
  action = null;
  graphics = FROG_LAYERS;
  shown = FROG_SIT_MASK;
  jumping = false;

  /**
   * Sets the frog to jump to the given lilypad
   * @param {import('./main.mjs').Entity} lily 
   */
  JumpTo(dx, dy, dSq) {
    const distance = Math.sqrt(dSq);

    if (distance > FROG_JUMP_LIMIT) {
      return;
    }
    
    const bearing = (Math.atan2(-dy, -dx) + TWO_PI) % TWO_PI;

    this.jumping = true;
    this.shown = FROG_JUMP_MASK;
    this.facing = bearing;
    this.action = {
      rotation: 0,
      duration: distance / FROG_SPEED,
      speed: FROG_SPEED
    };
  }

  JumpToEntity(target) {
    const dx = this.x - target.x;
    const dy = this.y - target.y;
    const dSq = dx * dx + dy * dy;

    this.JumpTo(dx, dy, dSq);
  }
}
