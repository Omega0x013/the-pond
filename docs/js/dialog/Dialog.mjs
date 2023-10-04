/**
 * The dialog superclass defines the two methods for a dialog, and binds them
 * correctly to the instance.
 */
export class Dialog {
    /**
     * @param {HTMLDialogElement} dialog Dialog 
     */
    constructor(dialog) {
        this.dialog = dialog;

        this.dialog.addEventListener('open', this.open.bind(this));
        this.dialog.addEventListener('close', this.close.bind(this));
    }

    /**
     * Called to open the dialog, and fill it with the appropriate values
     */
    open() {
        if (this.dialog.open) return;
        this.dialog.showModal();
    }

    /**
     * Triggered when the dialog is submitted / closed
     * @param {Event} _event 
     */
    close(_event) {}
}