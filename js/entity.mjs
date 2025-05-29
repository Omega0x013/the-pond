/**
 * The methods used to interact with entities.
 */

// Types.

/**
 * @typedef {Object} Layer A drawable image layer
 * @property {boolean} enabled Whether or not to draw this layer
 * @property {HTMLImageElement} image Source image used to draw the layer
 * @property {number} cx Rotational center of the image
 * @property {number} cy Rotational center of the image
 * @property {number} scale Scale factor used to draw the image
 * @property {number | undefined} orientation Fixed orientation rotation
 */

/**
 * @typedef {Object} Action The movement, rotation, and direction of an action
 * @property {number} duration The millisecond duration remaining
 * @property {number} rotation The rad/ms rotation of the object
 * @property {number} speed The pt/ms speed of the object
 */

/**
 * @typedef {Object} Entity Entities are game objects, implemented as circles.
 * @property {number} x Center of the entity
 * @property {number} y Center of the entity
 * @property {number} radius Radius of the entity
 * @property {number | null} facing Orientation of the entity (rad)
 * @property {Action | null} action The action the entity is performing
 * @property {boolean[]} layers Whether each layer is enabled/disabled
 */

// Graphics.

/**
 * @type {Layer[]}
 */
export const FLY_LAYERS = [
    {
        image: document.querySelector('#fly'),
        scale: .1,
        cx: 189,
        cy: 70
    }
]

/**
 * @type {Layer[]}
 */
export const FROG_LAYERS = [
    {
        image: document.querySelector('#frog-sit'),
        scale: .25,
        cx: 135,
        cy: 120
    },
    {
        image: document.querySelector('#frog-jump'),
        scale: .25,
        cx: 93,
        cy: 150
    }
]

/**
 * @type {Layer[]}
 */
export const LILY_LAYERS = [
    {
        image: document.querySelector('#lily'),
        scale: .25,
        cx: 170,
        cy: 170,
    },
    {
        image: document.querySelector('#pill'),
        scale: .1,
        cx: 200,
        cy: 275,
        orientation: 0
    },
    {
        image: document.querySelector('#cookie'),
        scale: .1,
        cx: 250,
        cy: 250,
        orientation: 0
    },
    {
        image: document.querySelector('#brush'),
        scale: .1,
        cx: 50,
        cy: 275,
        orientation: 0
    }
]

// Functions.

/**
 * How far away are the centres of `a` and `b`?
 * @param {Entity} a 
 * @param {Entity} b 
 * @returns {number}
 */
export function Distance(a, b) {
    return Math.hypot(b.x - a.x, b.y - a.y);
}

/**
 * The bearing needed to point `a` at `b`.
 * @param {Entity} a 
 * @param {Entity} b 
 * @returns {number} (rad)
 */
export function Bearing(a, b) {
    return Math.atan2(b.y - a.y, b.x - a.x);
}

/**
 * The coordinates of a point on the circumference of a circle on a given bearing.
 * @param {Entity} a 
 * @param {number} radius
 * @param {number} facing
 * @returns {{x: number, y: number}}
 */
export function OrbitPosition(a, radius, facing) {
    return {
        x: a.x + radius * Math.cos(facing),
        y: a.y + radius * Math.sin(facing)
    };
}

/**
 * Draw entity on screen.
 * @param {CanvasRenderingContext2D} context 
 * @param {{x: number, y: number}} camera
 * @param {Entity} a 
 */
export function Draw(context, camera, a, layers) {
    if (a.layers === null) {
        console.warn(`Draw(${a}): tried to draw entity with no graphics.`);
        return;
    }

    for (let i = 0; i < layers.length; i++) {
        const layer = layers[i]

        if (!a.layers[i]) {
            continue;
        }

        context.save();
        context.translate(a.x - camera.x, a.y - camera.y);
        // Respect an absolute orientation defined within a layer
        if ("orientation" in layer) {
            context.rotate(layer.orientation);
        } else {
            context.rotate(a.facing + Math.PI / 2);
        }
        context.scale(layer.scale, layer.scale);
        context.drawImage(layer.image, -layer.cx, -layer.cy);
        context.restore();
    }
}

/**
 * Evaluate action logic of the entity, erasing the action once it's complete
 * @param {Entity} a 
 * @param {number} elapsed
 */
export function Move(a, elapsed) {
    // Short-circuit if there's no action to perform.
    if (a.action === null) {
        return;
    }
    // Choose the lower time for the calculations.
    const time = Math.min(elapsed, a.action.duration);

    // Rotate the entity.
    a.facing += a.action.rotation * time;

    // Move it according to its speed.
    // Here I've implicitly coupled facing direction and movement direction.
    const {x, y} = OrbitPosition(a, a.action.speed * time, a.facing);
    a.x = x;
    a.y = y;

    // Apply the duration changes / erase the action.
    if (elapsed < a.action.duration) {
        a.action.duration -= elapsed;
    } else {
        a.action = null;
    }
}
