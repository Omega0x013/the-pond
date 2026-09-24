import { RandomBearing, RandomDisc, RandomNormal } from "./random.mjs";


export const LILY_LAYERS = [
  {
    image: document.querySelector('#lily'),
    scale: .25,
    cx: 170,
    cy: 170,
  },
  {
    image: document.querySelector('#brush'),
    scale: .1,
    cx: 50,
    cy: 275,
  },
  {
    image: document.querySelector('#cookie'),
    scale: .1,
    cx: 250,
    cy: 250,
  },
  {
    image: document.querySelector('#pill'),
    scale: .1,
    cx: 200,
    cy: 275,
  },
]


export const CHUNK_SIZE = 1024;
const CHUNK_DISC_RADIUS = 175;
const CHUNK_DISC_TRIES = 5;
const CHUNK_MARGIN = 25;

export const LILY_RADIUS_MEAN = 45;
// const LILY_SIZE_STDEV = 2.5;
// const LILY_SCAN_MAX = LILY_SIZE_MEAN * 3;
const ITEM_SPAWN_CHANCE = 0.02;
const LILY_ROTATION_CHANCE = 1;
const LILY_ROTATION_MEAN = 0;
const LILY_ROTATION_STDEV = Math.PI * 0.00001;

export const LILY_BASE_MASK = 0b0001;
const LILY_BRUSH_MASK = 0b0010;
const LILY_COOKIE_MASK = 0b0100;
const LILY_PILL_MASK = 0b1000;

export const LILY_STRIDE = 6;
export const LILY_OFFSET_X = 0;
export const LILY_OFFSET_Y = 1;
export const LILY_OFFSET_RADIUS = 2;
export const LILY_OFFSET_FACING = 3;
export const LILY_OFFSET_SHOWN = 4;
export const LILY_OFFSET_ROTATION = 5;


const ITEMS = [
  {
    name: "Brush",
    // layer: 1,
  },
  {
    name: "Cookie",
    // layer: 2,
  },
  {
    name: "Pill",
    // layer: 3,
  },
]


/**
 * @param {Float32Array} chunk 
 * @param {number} offset 
 * @param {number} x 
 * @param {number} y 
 */
export function CreateLily(chunk, offset, x, y) {
  chunk[offset + LILY_OFFSET_X] = x;
  chunk[offset + LILY_OFFSET_Y] = y;
  chunk[offset + LILY_OFFSET_RADIUS] = LILY_RADIUS_MEAN;
  chunk[offset + LILY_OFFSET_FACING] = RandomBearing();

  chunk[offset + LILY_OFFSET_SHOWN] = LILY_BASE_MASK;
  if (Math.random() < ITEM_SPAWN_CHANCE) {
    // const item = ITEMS.at(Math.floor(Math.random() * ITEMS.length));
    chunk[offset + LILY_OFFSET_SHOWN] |= 1 << Math.ceil(Math.random() * ITEMS.length)
  }

  if (Math.random() < LILY_ROTATION_CHANCE) {
    chunk[offset + LILY_OFFSET_ROTATION] = RandomNormal(LILY_ROTATION_MEAN, LILY_ROTATION_STDEV);
  }
}


/**
 * Converts given chunk position into a map index.
 * @returns {number}
 */
export function ChunkIndex(chunkX, chunkY) {
  // Zigzag encode chunk position
  const zig_x = chunkX >= 0 ? chunkX * 2 : -chunkX * 2 - 1;
  const zig_y = chunkY >= 0 ? chunkY * 2 : -chunkY * 2 - 1;

  // Combine into a single number
  return ((zig_x << 16) | zig_y) >>> 0;
}


/**
 * Find the 5x5 grid of chunks nearby. Writes into result, returning number of chunks written
 * @param {Map<number, Float32Array>} lilies 
 * @param {number} x 
 * @param {number} y 
 * @param {Float32Array[]} result
 * @returns {number}
 */
export function FindLocalChunks(lilies, x, y, result = []) {
  let count = 0;
  const targetX = Math.floor(x / CHUNK_SIZE), targetY = Math.floor(y / CHUNK_SIZE);

  for (let dx = -2; dx < 2; dx += 1) {
    for (let dy = -2; dy < 2; dy += 1) {
      const chunkX = targetX + dx, chunkY = targetY + dy;
      const chunkId = ChunkIndex(chunkX, chunkY);

      let chunk = lilies.get(chunkId);
      if (!chunk) {
        chunk = CreateRandomChunk(chunkX * CHUNK_SIZE, chunkY * CHUNK_SIZE);
        lilies.set(chunkId, chunk);
      }

      result[count] = chunk;
      count += 1;
    }
  }

  return count;
}


/**
 * @param {number} baseX 
 * @param {number} baseY 
 * @returns {Float32Array}
 */
export function CreateRandomChunk(baseX, baseY) {
  const sample = RandomDisc([CHUNK_SIZE - CHUNK_MARGIN*2, CHUNK_SIZE - CHUNK_MARGIN*2], CHUNK_DISC_RADIUS, CHUNK_DISC_TRIES);
  const chunk = new Float32Array(sample.length * LILY_STRIDE);
  let offset = 0;
  for (const [x, y] of sample) {
    CreateLily(chunk, offset, baseX + x + CHUNK_MARGIN, baseY + y + CHUNK_MARGIN);
    offset += LILY_STRIDE;
  }
  return chunk;
}


// /**
//  * 
//  * @param {import("../game2/entity.mjs").Entity} x 
//  * @param {*} y 
//  * @returns 
//  */
// export function CreateLily(x, y) {
//   const lily = {
//     x, y,
//     radius: LILY_SIZE_MEAN, // not currently supporting varied sizes
//     facing: RandomBearing(),
//     graphics: LILY_LAYERS,
//     shown: LILY_BASE_MASK // default graphics
//   };

//   // Some lilies spin
//   if (Math.random() < LILY_ROTATION_CHANCE) {
//     lily.action = {
//       rotation: RandomNormal(LILY_ROTATION_MEAN, LILY_ROTATION_STDEV),
//       duration: Infinity,
//       speed: 0,
//     }
//   }

//   // Some lilies have items
//   if (Math.random() < ITEM_SPAWN_CHANCE) {
//     const item = ITEMS.at(Math.floor(Math.random() * ITEMS.length));
//     lily.item = item.name;
//     lily.shown |= 1 << item.layer;
//   }

//   return lily;
// }
