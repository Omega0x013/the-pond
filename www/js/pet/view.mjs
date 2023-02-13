import { getStats } from "./stat.mjs";

const pet = document.querySelector('#pet svg');

const faces = ['happy', 'sad', 'dead', 'joyful'].map(face => pet.querySelector(`#${face}`));

/**
 * Hides all but the relevant face
 * @param {string} name 
 */
function setVisible(name) {
    for (const face of faces) {
        if (face.id === name) {
            face.classList.remove('hidden');
        } else {
            face.classList.add('hidden');
        }
    }
}

/**
 * Every 10 seconds the state of the pet is checked, and the view updated.
 * @param {Event} _event 
 * @returns {void}
 */
export function updatePet(_event) {
    const stats = getStats();

    const mean = (((stats.food + stats.sleep + stats.clean) / 3) + stats.joy) / 100;

    switch(true) {
        case mean > 0.75:
            setVisible('joyful');
            break;
        case mean > 0.25:
            setVisible('happy');
            break;
        case mean > 0:
            setVisible('sad');
            break;
        default:
            setVisible('dead');
            break;
    }
}

updatePet();
setInterval(updatePet, 1000)