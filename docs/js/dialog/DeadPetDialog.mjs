import { Dialog } from "./Dialog.mjs";

// *** https://gist.github.com/Erichain/6d2c2bf16fe01edfcffa
function convertMS(milliseconds) {
    var day, hour, minute, seconds;
    seconds = Math.floor(milliseconds / 1000);
    minute = Math.floor(seconds / 60);
    seconds = seconds % 60;
    hour = Math.floor(minute / 60);
    minute = minute % 60;
    day = Math.floor(hour / 24);
    hour = hour % 24;
    return `${day}d ${hour}h ${minute}m ${seconds}s`;
}
// ***

export class DeadPetDialog extends Dialog {
    constructor() {
        super(document.querySelector('#dead-pet'));
    }

    open() {
        if (this.dialog.open) return;
        this.dialog.querySelector('#petname').textContent = localStorage.getItem('petname');
        this.dialog.querySelector('#lived').textContent = convertMS(Date.now() - +localStorage.getItem('born'));
        this.dialog.showModal();
    }

    close() {
        document.querySelector('#new-pet').dispatchEvent(new Event('open'));
    }
}