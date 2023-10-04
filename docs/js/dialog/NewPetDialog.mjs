import { Dialog } from "./Dialog.mjs";

export class NewPetDialog extends Dialog {
    constructor() {
        super(document.querySelector('#new-pet'));
    }

    /**
     * When the new-pet dialog is submitted, all storage items are reset, and the new pet name is used
     * @param {Event} _event 
     */
    close(_event) {
        localStorage.setItem('petname', this.dialog.querySelector('#petnameinput').value?.replace(/[\<\>]/gi,'') ?? '');
        localStorage.setItem('food', 80);
        localStorage.setItem('sleep', 0);
        localStorage.setItem('clean', 80);
        localStorage.setItem('born', Date.now());
        localStorage.setItem('last', Date.now());
    }
}