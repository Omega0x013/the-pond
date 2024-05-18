import { Dialog } from "./Dialog.mjs";

export class ExhaustedDialog extends Dialog {
    constructor() {
        super(document.querySelector('#exhausted'));
    }

    open() {
        if (this.dialog.open) return;
        this.dialog.querySelector('#petname2').textContent = `${localStorage.getItem('petname')} is exhausted!`;
        this.dialog.showModal();
    }
}