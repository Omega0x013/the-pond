/**
 * Produce an evenly distributed random number.
 * @param {number} start 
 * @param {number} end 
 * @returns {number}
 */
export function Random(start, end) {
    return start + Math.random() * (end - start);
}

/**
 * Produce a random number along a normal curve.
 * @param {number} mean 
 * @param {number} stdev 
 * @returns {number}
 */
export function Normal(mean, stdev) {
    const u = Math.random();
    const v = Math.random();
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return mean + z * stdev;
}

/**
 * Generate a random direction for an entity's facing property, between 0 and 2pi rad.
 * @returns {number}
 */
export function RandomBearing() {
    return Math.random() * Math.PI * 2;
}

export function RandomDisc(shape, radius, tries) {
    const p = new FastPoissonDiskSampling({
        shape: shape,
        radius: radius,
        tries: tries
    });
    p.addPoint([1000, 1000]);
    return p.fill();
}
