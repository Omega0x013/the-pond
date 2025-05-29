/**
 * Produces a random number along a normal curve.
 * @param {number} mean 
 * @param {number} stdev 
 * @returns {number}
 */
export function Random(mean, stdev) {
    const u = Math.random();
    const v = Math.random();
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return mean + z * stdev;
}

/**
 * Generate a random direction for an entity's facing property
 * @returns {number} (rad)
 */
export function RandomBearing() {
    return Math.random() * Math.PI * 2;
}
