const TWO_PI = Math.PI * 2;

/**
 * Produce a random number along a normal curve.
 * @param {number} mean 
 * @param {number} stdev 
 * @returns {number}
 */
export function RandomNormal(mean, stdev) {
  return mean + Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(TWO_PI * Math.random()) * stdev;
}


/**
 * Generate a random direction for an entity's facing property, between 0 and 2pi rad.
 * @returns {number}
 */
export function RandomBearing() {
  return Math.random() * TWO_PI;
}


// TODO: add support for infinite map
export function RandomDisc(shape, radius, tries) {
  const p = new FastPoissonDiskSampling({
    shape: shape,
    radius: radius,
    tries: tries
  });
  p.addPoint([1000, 1000]);
  return p.fill();
}
