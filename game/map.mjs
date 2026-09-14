import { LILY_LAYERS } from "../sprite/lily/lily.mjs";
import { RandomBearing, RandomNormal } from "./random.mjs";

export const LILY_SIZE_MEAN = 45;
// const LILY_SIZE_STDEV = 2.5;
// const LILY_SCAN_MAX = LILY_SIZE_MEAN * 3;
const ITEM_SPAWN_CHANCE = 0.02;
const LILY_ROTATION_CHANCE = 1;
const LILY_ROTATION_MEAN = 0;
const LILY_ROTATION_STDEV = Math.PI * 0.00001;

const ITEMS = [
  {
    name: "Brush",
    layer: 1,
  },
  {
    name: "Cookie",
    layer: 2,
  },
  {
    name: "Pill",
    layer: 3,
  },
]

/**
 * 
 * @param {import("../game2/entity.mjs").Entity} x 
 * @param {*} y 
 * @returns 
 */
export function CreateLily(x, y) {
  const lily = {
    x, y,
    radius: LILY_SIZE_MEAN, // not currently supporting varied sizes
    facing: RandomBearing(),
    graphics: LILY_LAYERS,
    shown: [true, false, false, false] // default graphics
  };

  // Some lilies spin
  if (Math.random() < LILY_ROTATION_CHANCE) {
    lily.action = {
      rotation: RandomNormal(LILY_ROTATION_MEAN, LILY_ROTATION_STDEV),
      duration: Infinity,
      speed: 0,
    }
  }

  // Some lilies have items
  if (Math.random() < ITEM_SPAWN_CHANCE) {
    const item = ITEMS.at(Math.floor(Math.random() * ITEMS.length));
    lily.item = item.name;
    lily.shown[item.layer] = true;
  }

  return lily;
}
