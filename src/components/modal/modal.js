import { EventTypeEnum } from "../../enums/enums";

export default class Modal extends HTMLElement {
    constructor() {
        super();
    }

    get title() {
        const prop = this.getAttribute('title');
        return prop ? prop : 'PManagement';
    }

    set title(value) {
        this.setAttribute("title", value);
    }

    static get observedAttributes() {
        return ["title"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "title" && this.shadowRoot) {
            this.shadowRoot.querySelector("h2").textContent = newValue;
        }
    }

    connectedCallback() {
        this._render();
        this._appendListeners();
    }

    _render() {
        const modal = document.createElement('div');
        modal.id = 'app-modal';
        modal.innerHTML = `
            <style>            
                .modal {
                    position: absolute;
                    z-index: 1000;
                    background-color: white;
                    padding: 1rem;
                    border-radius: 10px;
                    margin: auto;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                    right: 0;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    height: fit-content;
                    max-width: 30rem;
                }

                slot[name="content"] {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                    padding: 0.5rem;
                }

                slot[name="actions"]{
                    display: flex;
                    align-items:center;
                    justify-content:center;
                }

                button {
                    font: inherit;
                    padding: 0.5rem 1.5rem;
                    cursor: pointer;
                    border: 1px solid var(--accent);
                }
                
                button:hover {
                    color: #21212180 !important;
                }

                button:focus {
                    outline: none;
                }

                .btn-accent {
                    background-color: var(--accent);
                    color: var(--primary-text-color);
                }

                .btn-text {
                    background-color: transparent;
                }

                @media only screen and (max-width: 768px) {
                    .modal {
                        max-width: unset;
                        margin: auto 15px;
                    }
                }
            </style>
            <div class="modal">
                <div id="modal-header">
                    <h2>${this.title}</h2>
                </div>
                <slot name="content">No content</slot>
                <slot name="actions">
                    <button id="cancel" class="btn-text">Cancel</button>
                    <button id="confirm" class="btn-accent">Confirm</button>
                </slot>
            </div>
        `;

        modal.querySelector('button#cancel').addEventListener('click', () => this.dispatchEvent(new CustomEvent(EventTypeEnum.cancel)));
        modal.querySelector('button#confirm').addEventListener('click', () => this.dispatchEvent(new CustomEvent(EventTypeEnum.confirm, { detail: this.querySelectorAll('input') })));
        this.attachShadow({ mode: 'open' }).appendChild(modal);
    }

    _appendListeners() {
        const actionButtons = this.querySelectorAll('button');
        actionButtons.forEach(button => {
            button.addEventListener('click', () => this.dispatchEvent(new CustomEvent(button.attributes.actionType.value, { detail: { inputs: this.querySelectorAll('input'), target: button } })))
        });
    }
}