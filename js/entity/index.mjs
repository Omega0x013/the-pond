export { Point } from './base/Point.mjs';
export { Bug } from './Bug.mjs';
export { Lily } from './Lily.mjs';
export { Frog } from './Frog.mjs';

/**
 * Adds a number to a stat, then passes the number through
 * @param {string} key Identifier to access in localStorage
 * @param {number} change Amount by which to increase the stat
 * @returns number
 */
export function addStat(key, change) {
    console.warn("addStat is temporarily disabled.");
    return;
    // let stat = +localStorage.getItem(key);

    // if (Number.isNaN(stat))
    //     stat = 0;

    // stat += change;

    // if (stat < 0) stat = 0;
    // if (stat > 100) stat = 100;

    // localStorage.setItem(key, stat);
    // return stat;
}