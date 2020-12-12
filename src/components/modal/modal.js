import './modal.css'

export default class Modal extends HTMLElement {
    constructor(templateInputs) {
        super();

        this.backdrop = document.createElement('div');
        this.backdrop.classList.add('overlay');
        const modal = document.createElement('div');
        modal.id = 'modal';

        if (templateInputs) {
            templateInputs.forEach((element) => {
                modal.append(element);
            });
        }

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('flex', 'align-center', 'justify-end');

        this.cancelButton = document.createElement('button');
        this.cancelButton.id = 'cancel';
        this.cancelButton.textContent = 'Cancel';

        this.confirmButton = document.createElement('button');
        this.confirmButton.id = 'confirm';
        this.confirmButton.textContent = 'Confirm';

        buttonContainer.append(this.cancelButton);
        buttonContainer.append(this.confirmButton);
        modal.append(buttonContainer);

        this.hideHandler = this.hide.bind(this);
        this.backdrop.addEventListener('click', this.hideHandler);
        this.cancelButton.addEventListener('click', this.hideHandler);
        this.confirmHandler = this._confirm.bind(this);
        this.confirmButton.addEventListener('click', this.confirmHandler);
        this.append(modal);
    }

    open(inputs) {
        for (const name in inputs) {
            const input = this.querySelector(`input[name="${name}"]`);
            if (input) {
                input.value = inputs[name];
            }
        }
        document.body.insertAdjacentElement('afterbegin', this.backdrop);
        this.backdrop.append(this);
    }

    hide(event) {
        if (!event || event.target.classList.contains('overlay') || event.target.id == 'cancel') {
            const hasInputs = this.querySelectorAll('input');
            for (const input of hasInputs) {
                input.value = '';
            }
            this.remove();
            this.backdrop.remove();
        }
    }

    _confirm() {
        const hasInputs = this.querySelectorAll('input');
        const response = new Map();
        for (const input of hasInputs) {
            response.set(input.name, input.value);
        }
        const confirmEvent = new CustomEvent('confirm', { detail: response });
        this.dispatchEvent(confirmEvent);
    }

    removeModalEventListeners() {
        this.cancelButton.removeEventListener('click', this.hideHandler);
        this.confirmButton.removeEventListener('click', this.confirmHandler);
        this.backdrop.removeEventListener('click', this.hideHandler);
    }
}

if (!customElements.get('modal-template')) {
    customElements.define('modal-template', Modal);
}
