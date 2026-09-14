import { FLY_LAYERS } from "../sprite/fly/fly.mjs";
import { RandomBearing, RandomNormal } from "./random.mjs";

const TWO_PI = Math.PI * 2;

const FLY_ORBIT = 1000;
export const FLY_ORBIT_SQ = FLY_ORBIT * FLY_ORBIT;
const FLY_DURATION_MEAN = 2000;
const FLY_DURATION_STDEV = 500;
const FLY_ROTATION_MEAN = 0;
const FLY_ROTATION_STDEV = Math.PI * 0.0005;
const FLY_SPEED_MEAN = 0.15;
const FLY_SPEED_STDEV = 0.05;


export function CreateFly(frog) {
  const fly = {
    x: 0,
    y: 0,
    graphics: FLY_LAYERS,
    shown: [true],
    action: CreateFlyAction(),
  }

  RepositionFly(fly, frog);

  return fly;
}


/** Place the fly in a random position around the frog, facing toward the frog */
export function RepositionFly(fly, frog) {
  const bearing = RandomBearing();
  fly.x = frog.x + FLY_ORBIT * Math.cos(bearing);
  fly.y = frog.y + FLY_ORBIT * Math.sin(bearing);

  // TODO: try out deviating fly starting directions
  fly.facing = (bearing + Math.PI) % TWO_PI;
}


/** Moving forwards, turning randomly left or right for ~2s. */
export function CreateFlyAction() {
  return {
    rotation: RandomNormal(FLY_ROTATION_MEAN, FLY_ROTATION_STDEV),
    speed: Math.abs(RandomNormal(FLY_SPEED_MEAN, FLY_SPEED_STDEV)),
    duration: Math.abs(RandomNormal(FLY_DURATION_MEAN, FLY_DURATION_STDEV)),
  }
}
